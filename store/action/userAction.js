import * as actionTypes from "./actionTypes";

/* =================== */
/* Authentication */
/* =================== */
const authSuccess = (data) => {
    return {
        type: actionTypes.AUTH_SUCCESS,
        data
    };
};

export const onAuthSuccess = (data) => (dispatch) => {
    dispatch(authSuccess(data));
};