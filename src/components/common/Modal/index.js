"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";
import styles from "./Modal.module.css";

export default function Modal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  children,
  showActions = true,
}) {
  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      maxWidth="sm"
      fullWidth
      className={styles.dialog}
    >
      {title && (
        <DialogTitle id="alert-dialog-title" className={styles.title}>
          {title}
        </DialogTitle>
      )}
      <DialogContent className={styles.content}>
        {message && (
          <DialogContentText
            id="alert-dialog-description"
            className={styles.message}
          >
            {message}
          </DialogContentText>
        )}
        {children}
      </DialogContent>
      {showActions && (
        <DialogActions className={styles.actions}>
          <Button
            onClick={onClose}
            color="primary"
            className={styles.cancelButton}
          >
            {cancelText}
          </Button>
          <Button
            onClick={onConfirm}
            color="primary"
            variant="contained"
            autoFocus
            className={styles.confirmButton}
          >
            {confirmText}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
}
