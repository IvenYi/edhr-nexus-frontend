import com.fasterxml.jackson.databind.ObjectMapper;
import com.zencas.edhr.common.util.SnowflakeIdGenerator;
import com.zencas.edhr.compliance.entity.AuditEvent;
import com.zencas.edhr.compliance.repository.AuditEventRepository;
import com.zencas.edhr.masterdata.entity.Material;
import com.zencas.edhr.masterdata.repository.*;
import com.zencas.edhr.masterdata.service.ProductProcessResolutionService;
import com.zencas.edhr.production.controller.WorkOrderController;
import com.zencas.edhr.production.engine.WorkOrderStatusMachine;
import com.zencas.edhr.production.entity.WorkOrder;
import com.zencas.edhr.production.repository.*;
import com.zencas.edhr.production.service.*;
import com.zencas.edhr.workflow.engine.*;
import jakarta.persistence.*;
import org.hibernate.cfg.Configuration;
import org.springframework.aop.framework.ProxyFactory;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;
import org.springframework.orm.jpa.JpaTransactionManager;
import org.springframework.orm.jpa.SharedEntityManagerCreator;
import org.springframework.transaction.annotation.AnnotationTransactionAttributeSource;
import org.springframework.transaction.interceptor.TransactionInterceptor;
import java.math.BigDecimal;
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.*;
import static org.mockito.Mockito.*;
import static org.mockito.ArgumentMatchers.*;

/** Independent diagnostic only: real Hibernate/JPA, H2 and Spring transaction proxies. */
public class CloseJpaRaceProbe {
  @SuppressWarnings("deprecation")
  private static <T> T txProxy(T target, JpaTransactionManager tx) {
    ProxyFactory proxy = new ProxyFactory(target);
    proxy.setProxyTargetClass(true);
    proxy.addAdvice(new TransactionInterceptor(tx, new AnnotationTransactionAttributeSource()));
    return (T) proxy.getProxy();
  }
  public static void main(String[] args) throws Exception {
    var factory = new Configuration().addAnnotatedClass(WorkOrder.class)
      .setProperty("hibernate.connection.driver_class", "org.h2.Driver")
      .setProperty("hibernate.connection.url", "jdbc:h2:mem:independent_close_jpa_race;DB_CLOSE_DELAY=-1;LOCK_TIMEOUT=10000")
      .setProperty("hibernate.hbm2ddl.auto", "create-drop")
      .setProperty("hibernate.show_sql", "false").buildSessionFactory();
    EntityManager initial = factory.createEntityManager();
    initial.getTransaction().begin();
    initial.persist(WorkOrder.builder().id(100L).orderNo("INDEPENDENT-RACE").productId(7L)
      .plannedQuantity(BigDecimal.TEN).status("COMPLETED").build());
    initial.createNativeQuery("CREATE TABLE probe_audit(id BIGINT PRIMARY KEY,before_json VARCHAR(10000),after_json VARCHAR(10000))").executeUpdate();
    initial.getTransaction().commit(); initial.close();
    EntityManager em = SharedEntityManagerCreator.createSharedEntityManager(factory);
    JpaTransactionManager tx = new JpaTransactionManager(factory);
    var orders = mock(WorkOrderRepository.class);
    when(orders.findByTenantIdAndId(eq("default"),anyLong())).thenAnswer(i ->
      em.createQuery("select workOrder from WorkOrder workOrder where workOrder.tenantId = :tenantId and workOrder.id = :id",WorkOrder.class)
       .setParameter("tenantId","default").setParameter("id",i.getArgument(1)).getResultStream().findFirst());
    when(orders.findByTenantIdAndIdForUpdate(eq("default"),anyLong())).thenAnswer(i ->
      em.createQuery("select workOrder from WorkOrder workOrder where workOrder.tenantId = :tenantId and workOrder.id = :id",WorkOrder.class)
       .setParameter("tenantId","default").setParameter("id",i.getArgument(1)).setLockMode(LockModeType.PESSIMISTIC_WRITE).getResultStream().findFirst());
    when(orders.save(any(WorkOrder.class))).thenAnswer(i -> i.getArgument(0));
    var materials = mock(MaterialRepository.class);
    var versions = mock(ProductProcessVersionRepository.class);
    var audits = mock(AuditEventRepository.class);
    when(audits.save(any(AuditEvent.class))).thenAnswer(i -> {
      AuditEvent audit = i.getArgument(0);
      em.createNativeQuery("INSERT INTO probe_audit VALUES(:id,:before,:after)")
        .setParameter("id",audit.getId()).setParameter("before",audit.getContentBefore()).setParameter("after",audit.getContentAfter()).executeUpdate();
      return audit;
    });
    var ids=mock(SnowflakeIdGenerator.class); var sequence=new AtomicLong(1000);
    when(ids.nextId()).thenAnswer(i -> sequence.incrementAndGet());
    var context=new AnnotationConfigApplicationContext(WorkOrderStatusMachine.class,StateMachineRegistry.class,StateMachineService.class);
    var service=txProxy(new ProductionService(orders,mock(ProductionObjectRepository.class),materials,versions,
      mock(ProductProcessResolutionService.class),context.getBean(StateMachineService.class),ids,mock(DhrInstanceService.class)),tx);
    var controller=txProxy(new WorkOrderController(orders,materials,versions,service,mock(ProductionOutputService.class),ids,audits,new ObjectMapper()),tx);
    ExecutorService executor=Executors.newSingleThreadExecutor(); var firstSnapshot=new AtomicBoolean(true);
    when(materials.findByTenantIdAndId("default",7L)).thenAnswer(i -> {
      if(firstSnapshot.compareAndSet(true,false)) {
        // A has read COMPLETED but has not reached its locking service call.
        var result=executor.submit(() -> controller.close(100L)).get(10,TimeUnit.SECONDS);
        System.out.println("B committed first: "+result.getData().status());
      }
      return Optional.of(Material.builder().id(7L).code("P").name("Probe product").build());
    });
    var resultA=controller.close(100L);
    EntityManager inspect=factory.createEntityManager();
    Number count=(Number)inspect.createNativeQuery("SELECT count(*) FROM probe_audit").getSingleResult();
    System.out.println("A result after B already committed CLOSED: "+resultA.getData().status());
    System.out.println("Audit count: "+count);
    var rows=inspect.createNativeQuery("SELECT before_json,after_json FROM probe_audit ORDER BY id").getResultList();
    for(Object row:rows) { Object[] values=(Object[])row; var mapper=new ObjectMapper();
      System.out.println("Audit status: "+mapper.readTree(values[0].toString()).path("status").asText()+" -> "+mapper.readTree(values[1].toString()).path("status").asText());
    }
    boolean reproduced=count.intValue()==2;
    inspect.close(); executor.shutdownNow();context.close();factory.close();
    if(!reproduced) throw new AssertionError("Duplicate close was not reproduced");
    System.out.println("REPRODUCED: two successful closes and duplicate COMPLETED->CLOSED audits despite the row lock.");
  }
}
