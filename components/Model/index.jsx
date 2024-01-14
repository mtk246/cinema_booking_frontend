import React from "react";

const Modal = (props) => {
    return (
        <div
            style={
                props.showed
                    ? { transform: "translateY(0)" }
                    : { transform: "translateY(-100vh)" }
            }
            className="Modal"
        >
            {props.children}
            <div className="d-flex justify-content-end">
                <button
                    className="btn btn-outline-danger"
                    onClick={props.closeMode}
                >
                    Close
                </button>
            </div>
        </div>
    );
};

export default Modal;
