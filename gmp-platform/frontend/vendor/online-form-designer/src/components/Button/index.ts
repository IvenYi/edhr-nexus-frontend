import { withInstall } from '/@/utils';
import type { ExtractPropTypes } from 'vue';
import button from './src/BasicButton.vue';
import popConfirmButton from './src/PopConfirmButton.vue';
import { buttonProps } from './src/props';
import CustomButton from './src/custom-button.vue';

export const Button = withInstall(button);
export const PopConfirmButton = withInstall(popConfirmButton);
export { CustomButton };
export declare type ButtonProps = Partial<ExtractPropTypes<typeof buttonProps>>;
