import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";

function StatusCard(props) {
    return (
        <div
            className={"p-3 border rounded-3 my-2 " + props.type}
        >
            <div className="d-flex">
                <div className="me-3">
                    <FontAwesomeIcon
                        icon={faUser}
                    />
                </div>
                <div>
                    <p>{props.title}</p>
                    <p>
                        {props.value}
                    </p>
                </div>
            </div>
        </div>
    );
}

export default StatusCard;
