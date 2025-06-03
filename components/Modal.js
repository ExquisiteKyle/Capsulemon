import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";

const Modal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  children,
  showActions = true,
}) => {
  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      maxWidth="sm"
      fullWidth
    >
      {title && <DialogTitle id="alert-dialog-title">{title}</DialogTitle>}
      <DialogContent>
        {message && (
          <DialogContentText id="alert-dialog-description">
            {message}
          </DialogContentText>
        )}
        {children}
      </DialogContent>
      {showActions && (
        <DialogActions>
          <Button onClick={onClose} color="primary">
            {cancelText}
          </Button>
          <Button
            onClick={onConfirm}
            color="primary"
            variant="contained"
            autoFocus
          >
            {confirmText}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
};

export default Modal;
