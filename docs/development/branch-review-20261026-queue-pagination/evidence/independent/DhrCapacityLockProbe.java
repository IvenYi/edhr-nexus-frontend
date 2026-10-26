package com.zencas.edhr.production.service;

import java.sql.*;
import java.util.concurrent.*;
import org.springframework.jdbc.datasource.DataSourceTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

public class DhrCapacityLockProbe {
    static void require(boolean value,String message) { if(!value) throw new AssertionError(message); }
    static boolean locked(DhrEvidenceBatchPostgresTest t,long id) throws Exception {
        try(Connection c=t.source.getConnection()) {
            c.setAutoCommit(false);
            try { c.createStatement().executeQuery("SELECT id FROM form_instance_record WHERE id="+id+" FOR UPDATE NOWAIT"); c.rollback(); return false; }
            catch(SQLException e) { c.rollback(); if("55P03".equals(e.getSQLState())) return true; throw e; }
        }
    }
    public static void main(String[] args) throws Exception {
        var t=new DhrEvidenceBatchPostgresTest(); t.setup(); t.seed(2);
        var compared=new CountDownLatch(1); var release=new CountDownLatch(1);
        var executor=Executors.newSingleThreadExecutor();
        try(Connection writer=t.source.getConnection()) {
            writer.setAutoCommit(false);
            writer.createStatement().executeUpdate("UPDATE form_instance_record SET values_json='{\"x\":2}' WHERE id=2");
            var result=executor.submit(()->new TransactionTemplate(new DataSourceTransactionManager(t.source)).execute(status->{
                var changes=t.service.changes(2L,true); compared.countDown();
                try { require(release.await(15,TimeUnit.SECONDS),"release timeout"); } catch(InterruptedException e) { throw new RuntimeException(e); }
                return changes;
            }));
            long deadline=System.nanoTime()+TimeUnit.SECONDS.toNanos(10);
            boolean firstLocked=false;
            while(System.nanoTime()<deadline) { if(locked(t,1)){firstLocked=true;break;} Thread.sleep(20); }
            require(firstLocked,"batch must lock id1 before waiting on id2");
            require(!result.isDone(),"comparison must wait for writer");
            writer.commit();
            require(compared.await(10,TimeUnit.SECONDS),"comparison timeout");
            require(locked(t,1)&&locked(t,2),"locks must survive method return until outer transaction ends");
            release.countDown(); var changes=result.get(10,TimeUnit.SECONDS);
            require(changes.size()==1&&"2".equals(changes.get(0).path("recordId").asText()),"waited row must expose new committed value");
            require(!locked(t,1)&&!locked(t,2),"locks must release after commit");
            System.out.println("{\"idOrderObserved\":true,\"waitedRowFresh\":true,\"locksHeldThroughOuterTransaction\":true,\"locksReleasedAfterCommit\":true}");
        } finally { release.countDown(); executor.shutdownNow(); executor.awaitTermination(20,TimeUnit.SECONDS); t.cleanup(); }
    }
}
