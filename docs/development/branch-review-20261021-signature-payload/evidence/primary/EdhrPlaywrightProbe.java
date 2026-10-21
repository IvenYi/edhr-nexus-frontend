import com.microsoft.playwright.*;
import java.nio.file.*;
import java.util.*;
public class EdhrPlaywrightProbe {
 public static void main(String[] args) throws Exception {
  try (Playwright p = Playwright.create()) {
   System.out.println("DRIVER_CREATED");
   System.out.println("DEFAULT_EXECUTABLE="+p.chromium().executablePath());
   var options=new BrowserType.LaunchOptions().setHeadless(true);
   if (args.length>0 && args[0].equals("explicit")) options.setExecutablePath(Path.of("/usr/bin/chromium"));
   try (Browser b = p.chromium().launch(options)) {
    Page page=b.newPage(); page.setContent("<!doctype html><meta charset='UTF-8'><h1>合成打印验证</h1><p>Test only</p>");
    byte[] pdf=page.pdf(new Page.PdfOptions().setPath(Path.of("/tmp/edhr-sig-playwright-probe.pdf")));
    System.out.println("PDF_BYTES="+pdf.length);
   }
  }
 }
}
