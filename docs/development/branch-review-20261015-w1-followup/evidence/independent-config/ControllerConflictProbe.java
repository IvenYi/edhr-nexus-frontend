import java.sql.SQLException;
import com.zencas.edhr.production.controller.ProductionExecutionController;
import com.zencas.edhr.production.service.ProductionExecutionService;
import com.zencas.edhr.common.exception.BusinessException;
import static org.mockito.Mockito.*;

public class ControllerConflictProbe {
    public static void main(String[] args) {
        var service = mock(ProductionExecutionService.class);
        var controller = new ProductionExecutionController(service);
        RuntimeException serialization = new RuntimeException("outer", new RuntimeException("inner", new SQLException("snapshot", "40001")));
        doThrow(serialization).when(service).act(1L, null);
        try { controller.act(1L, null); throw new AssertionError("expected conflict"); }
        catch (BusinessException e) {
            if (e.getHttpStatus() != 400 || !e.getMessage().contains("请刷新后重试")) throw new AssertionError(e);
        }
        RuntimeException unrelatedSql = new RuntimeException("foreign key", new SQLException("fk", "23503"));
        doThrow(unrelatedSql).when(service).act(2L, null);
        try { controller.act(2L, null); throw new AssertionError("expected unrelated SQL failure"); }
        catch (RuntimeException e) { if (e != unrelatedSql) throw new AssertionError("failure replaced", e); }
        RuntimeException unrelated = new IllegalStateException("audit unavailable");
        doThrow(unrelated).when(service).act(3L, null);
        try { controller.act(3L, null); throw new AssertionError("expected unrelated failure"); }
        catch (RuntimeException e) { if (e != unrelated) throw new AssertionError("failure replaced", e); }
        verify(service, times(1)).act(1L, null);
        verify(service, times(1)).act(2L, null);
        verify(service, times(1)).act(3L, null);
        verifyNoMoreInteractions(service);
        System.out.println("ControllerConflictProbe: 3 checks passed (nested 40001 translation, other SQL rethrow, non-SQL rethrow); no retry");
    }
}
