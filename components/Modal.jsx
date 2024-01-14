import { ModalFooter, Button } from 'react-bootstrap';
import Modal from 'react-bootstrap/Modal';
import ModalBody from 'react-bootstrap/ModalBody';

export default function MyModal({ modalTitle, children, isOpen, toggle, onModalData, modalData }) {
    const handleSave = () => {
        onModalData(modalData);
    };
  
    return (
      <Modal show={isOpen} onHide={toggle} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>{modalTitle}</Modal.Title>
        </Modal.Header>
        <ModalBody>{children}</ModalBody>
        <ModalFooter>
          <Button variant="primary" onClick={handleSave}>Save</Button>
          <Button variant="secondary" onClick={toggle}>Close</Button>
        </ModalFooter>
      </Modal>
    );
};