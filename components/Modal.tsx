'use client';

import React from 'react';
import { Dialog, DialogPanel } from '@headlessui/react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
    return (
        <Dialog open={isOpen} onClose={onClose} className="relative z-50">
            <div className="popup-overlay fixed inset-0" aria-hidden="true" />
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <DialogPanel className="modal">
                    <h3 className="tour-header">{title}</h3>
                    <button className="close" onClick={onClose} aria-label="Close modal">
                        &times;
                    </button>
                    {children}
                </DialogPanel>
            </div>
        </Dialog>
    );
};

export default Modal;
