import * as actionTypes from '../action/actionTypes'

const initState = {
    name: "Dummy",
    email: null,
    token: null,
    role: 'admin',
};

const reducer = (state = initState, action) => {
    switch (action.type) {
        case actionTypes.AUTH_SUCCESS:
            return {
                ...state,
                name: action.data.name,
                token: action.data.token,
                role: action.data.role
            }
        default:
            return state;
    }
};

export default reducer;