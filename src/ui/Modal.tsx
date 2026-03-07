import { ComponentPropsWithoutRef, ReactNode, forwardRef } from "react";

interface ModalProps extends ComponentPropsWithoutRef<"dialog"> {
  children: ReactNode;
}

export const Modal = forwardRef<HTMLDialogElement, ModalProps>(
  ({ children, ...otherProps }, ref) => {
    const handleDialogClick = (e: React.MouseEvent<HTMLDialogElement>) => {
      const dialogDimensions = e.currentTarget.getBoundingClientRect();
      if (
        e.clientX < dialogDimensions.left ||
        e.clientX > dialogDimensions.right ||
        e.clientY < dialogDimensions.top ||
        e.clientY > dialogDimensions.bottom
      ) {
        e.currentTarget.close();
      }
    };

    return (
      <dialog {...otherProps} onClick={handleDialogClick} ref={ref}>
        {children}
      </dialog>
    );
  },
);

Modal.displayName = "Modal";

export default Modal;
