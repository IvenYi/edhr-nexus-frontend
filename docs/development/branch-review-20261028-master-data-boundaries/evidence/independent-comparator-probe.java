import com.zencas.edhr.masterdata.controller.ProcessModelingController;
public class EdhrBoundaryComparatorProbe { public static void main(String[] args) throws Exception {
var ctor=ProcessModelingController.class.getDeclaredConstructors()[0];ctor.setAccessible(true);
var controller=ctor.newInstance(new Object[ctor.getParameterCount()]);
var method=ProcessModelingController.class.getDeclaredMethod("compareVersion",String.class,String.class);method.setAccessible(true);
for(String[] pair:new String[][]{{"V2a3","V2b"},{"V2b","V2a3"}})System.out.println(pair[0]+" vs "+pair[1]+" = "+method.invoke(controller,pair[0],pair[1]));
} }
