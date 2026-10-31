import com.zencas.edhr.compliance.controller.FileController;
import com.zencas.edhr.compliance.repository.FileObjectRepository;
import com.zencas.edhr.common.util.SnowflakeIdGenerator;
import com.zencas.edhr.identity.repository.UserAccountRepository;
import com.zencas.edhr.system.repository.IconAssetRepository;
import com.zencas.edhr.system.repository.SystemSettingRepository;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.multipart.MultipartFile;
import java.io.ByteArrayInputStream;
import java.nio.ByteBuffer;
import java.nio.channels.FileChannel;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.util.concurrent.atomic.AtomicInteger;
import static org.mockito.Mockito.*;

class OwnedReservationProbe {
    public static void main(String[] args) throws Exception {
        Path directory=Files.createTempDirectory("edhr-copy-q1-reservation-");
        Path path=directory.resolve("77_original.txt");
        FileChannel[] reserved={null};
        try {
            var ids=mock(SnowflakeIdGenerator.class);when(ids.nextId()).thenReturn(77L);
            var files=mock(FileObjectRepository.class);
            var controller=new FileController(files,mock(IconAssetRepository.class),mock(SystemSettingRepository.class),mock(UserAccountRepository.class),ids);
            ReflectionTestUtils.setField(controller,"storagePath",directory.toString());
            MultipartFile upload=mock(MultipartFile.class);
            byte[] body="original evidence".getBytes(java.nio.charset.StandardCharsets.UTF_8);
            when(upload.getSize()).thenReturn((long)body.length);
            when(upload.getContentType()).thenReturn("text/plain");
            when(upload.getOriginalFilename()).thenReturn("original.txt");
            AtomicInteger opens=new AtomicInteger();
            when(upload.getInputStream()).thenAnswer(call->{
                if(opens.incrementAndGet()==2) reserved[0]=FileChannel.open(path,StandardOpenOption.READ);
                return new ByteArrayInputStream(body);
            });
            controller.upload(upload,"DOCUMENT_VERSION",null);
            ByteBuffer buffer=ByteBuffer.allocate(64);
            int fromReservedHandle=reserved[0].read(buffer);
            String atPath=Files.readString(path);
            boolean retained=fromReservedHandle==body.length;
            System.out.println("{\"expectedReservedHandleBytes\":"+body.length+",\"actualReservedHandleBytes\":"+fromReservedHandle+",\"pathBytesCorrect\":"+atPath.equals("original evidence")+",\"sameReservedFileObject\":"+retained+"}");
            if(!retained) throw new AssertionError("Successful copy replaced the previously reserved file object; reservation handle has no original bytes");
        } finally {
            if(reserved[0]!=null) reserved[0].close();
            Files.deleteIfExists(path);Files.deleteIfExists(directory);
        }
    }
}
