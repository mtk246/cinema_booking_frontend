import { Button, Modal, ModalBody, ModalFooter, ModalHeader, Spinner } from "react-bootstrap";
import { useState, useEffect, useCallback } from "react";
import Select from 'react-select';
import { getApi, postApi } from '../../../utils/api';
import { toast } from 'react-toastify';
import jsCookie from 'js-cookie';
import { decryptData } from "../../../utils/crypto";

export default function RecipeModal({recipeGroupId}) {
    const token = jsCookie.get('token');
    const decryptedToken = decryptData(token);
    const user_id = jsCookie.get('user_id');
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [stock, setStock] = useState([]);
    const [selectedIngredients, setSelectedIngredients] = useState([]);
    const [recipe, setRecipe] = useState('');
    const [recipeGroup, setRecipeGroup] = useState(recipeGroupId);
    const [recipeDetail, setRecipeDetail] = useState([]);
    const handleIngredientsChange = (selectedOptions) => {
        setSelectedIngredients(selectedOptions);
    };

    const handleShowModal = () => {
        handleRefresh();
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    const handleSubmit = async () => {
        const data = {
            "recipe_name": recipeGroup ? recipeDetail[0][0].recipe_group_name : recipe,
            "ingredients": selectedIngredients,
            "user_id": user_id,
            "recipe_group_id" : recipeGroup ? recipeDetail[0][0].recipe_group_id : "",
        };

        const postData = postApi(
            '/recipe',
            decryptedToken,
            data,
        );

        await postData.then((res) => {
            if (res.status === 200) {
                toast.success(res.data.message);
            }
            if (res.status === 403) {
                toast.error('Error');
            }
        });

        handleRefresh();
        setLoading(false);
        setShowModal(false);
    };

    const options = stock.length > 0 ?
        stock[0].map(item => {
            return {
                value: item.product_id,
                label: item.product_name,
            }
        }) : ([]);

    const handleRefresh = useCallback(async () => {
        setLoading(true);

        if (recipeGroup) {
            const fetchApi = getApi(`/recipeDetail?recipe_group_id=${recipeGroup}`, decryptedToken);

            await fetchApi.then((res) => {
                if (res.status === 200) {
                    setRecipeDetail(res.data?.result.length > 0 && res.data.result);
                }
                if (res.status === 403) {
                    toast.error("Error");
                }
            });
        }

        const fetchApi = getApi("/stock", decryptedToken);

        await fetchApi.then((res) => {
            if (res.status === 200) {
                setStock(res.data?.result.length > 0 && res.data.result);
            }
            if (res.status === 403) {
                toast.error("Error");
            }
        });

        setLoading(false);
    }, [decryptedToken]);

    useEffect(() => {
        handleRefresh();
    }, [handleRefresh]);

    return (
        <div className="mb-4 text-end">
            <Button variant="primary" onClick={handleShowModal}>
                {recipeGroup ? "Create Recipe" : "Create Recipe"}
            </Button>
            <Modal
                show={showModal}
                onHide={handleCloseModal}
                centered
                backdrop="static"
                dialogClassName="modal-xxl"
            >
                <ModalHeader closeButton>
                    <Modal.Title>
                        {recipeGroup ? "Create Recipe" : "Create Recipe"}
                    </Modal.Title>
                </ModalHeader>
                <ModalBody>
                    <form className="">
                        {!recipeGroup && (
                            <div className="d-flex flex-row align-items-center my-3">
                                <div>Recipe Name - </div>
                                <div className="mx-3">
                                    <input
                                        type="text"
                                        className="form-control"
                                        onChange={(e) => {setRecipe(e.target.value)}}
                                    />
                                </div>
                            </div>
                        )}
                        <div className="d-flex flex-row align-items-center my-3">
                            <div>Ingredients - </div>
                            <div className="w-75 mx-3">
                                <Select
                                    isMulti
                                    name="colors"
                                    options={options}
                                    className="basic-multi-select"
                                    classNamePrefix="select"
                                    onChange={handleIngredientsChange}
                                />
                            </div>
                        </div>
                    </form>
                </ModalBody>
                <ModalFooter>
                    { loading
                        ? ( <Spinner />)
                        : (
                            <Button variant="primary" onClick={handleSubmit}>
                                Save
                            </Button>
                        )
                    }
                    <Button variant="secondary" onClick={handleCloseModal}>
                        Close
                    </Button>
                </ModalFooter>
            </Modal>
        </div>
    );
}