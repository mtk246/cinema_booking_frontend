import MyModal from "../../Modal";
import { modalTitle } from "../../../utils/constants";
import { useState } from "react";

export { CreateBtn, EditBtn, CreateTableRowBtn };

function CreateBtn({ children, modalHeading }) {
    const [isOpen, setIsOpen] = useState(false);
    const toggleModal = () => setIsOpen(!isOpen);
    const handleModalData = (data) => {
        toggleModal();
    };

    return (
        <div className="mt-3">
            <button
                type="button"
                className="btn btn-primary"
                onClick={toggleModal}
            >
                { modalTitle.create }
            </button>
            <MyModal
                isOpen={isOpen}
                toggle={toggleModal}
                modalTitle={modalHeading}
                onModalData={handleModalData}
            >
                { children }
            </MyModal>
        </div>
    );
}

function EditBtn({ children, modalHeading }) {
    const [isOpen, setIsOpen] = useState(false);
    const toggleModal = () => setIsOpen(!isOpen);
    return (
        <div className="mt-3">
            <button
                type="button"
                className="btn btn-primary"
                onClick={toggleModal}
            >
                { modalTitle.edit }
            </button>
            <MyModal
                isOpen={isOpen}
                toggle={toggleModal}
                modalTitle={modalHeading}
            >
                { children }
            </MyModal>
        </div>
    );
}

function CreateTableRowBtn({ children, onClick }) {
    const [toggleTable, setToggleTable] = useState(false);
    const [clearChildren, setClearChildren] = useState(false);

    function onClickEvent() {
        setToggleTable(!toggleTable);
    }

    return (
        <div className="mt-3">
            {
                !clearChildren && (
                    toggleTable
                        ? (
                            <div>
                                {children}
                            </div>
                        )
                        : null
                    )
            }
            <button
                type="button"
                className={
                    !toggleTable ? "btn btn-primary" : "btn btn-success"
                }
                onClick={onClickEvent}
            >
                {
                    !toggleTable
                        ? modalTitle.create
                        : modalTitle.confirm
                }
            </button>
            {
                toggleTable && (
                    <button
                        type="button"
                        className="btn btn-danger"
                        onClick={() => setToggleTable(false)}
                    >
                        { modalTitle.cancel }
                    </button>
                )
            }
        </div>
    )
}
