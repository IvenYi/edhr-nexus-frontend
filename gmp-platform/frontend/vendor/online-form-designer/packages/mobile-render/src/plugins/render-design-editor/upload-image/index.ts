import { FIELD_TYPE } from '@gct/runtime';
import { widthRenderDesignEditorInstall } from '@gct/runtime-render';
import { UploadImage } from './upload-image';

export default widthRenderDesignEditorInstall(FIELD_TYPE.IMAGE, UploadImage);
