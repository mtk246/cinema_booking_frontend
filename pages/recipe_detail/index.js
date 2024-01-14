import { useRouter } from 'next/router';
import { getApi, putApi, postApi } from '../../utils/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faSyncAlt,
    faEye,
    faEyeSlash,
} from '@fortawesome/free-solid-svg-icons';
import { toast } from "react-toastify";
import useTranslation from "next-translate/useTranslation";
import MUIDataTable from "mui-datatables";
import Badge from 'react-bootstrap/Badge';
import RecipeModal from '../../components/layout/recipe/RecipeModal';
import jsCookie from "js-cookie";
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from "react-bootstrap";
import { useState } from 'react';
import { decryptData } from '../../utils/crypto';

export default function RecipeDetail({recipeDetailData}) {
    const router = useRouter();
    const {t} = useTranslation('common');
    const token = jsCookie.get('token');
    const decryptedToken = decryptData(token);
    const { recipe_group_id } = router.query;
    const [recipeDetail, setRecipeDetail] = useState(recipeDetailData);
    const [showModal, setShowModal] = useState(false);
    const [productPrice, setProductPrice] = useState('');

    const handleRefresh = async () => {
        const fetchApi = getApi("/recipeDetail?recipe_group_id=" + recipe_group_id, decryptedToken);

        await fetchApi.then((res) => {
            if (res.status === 200) {
                setRecipeDetail(res.data?.result.length > 0 && res.data.result);
            }
            if (res.status === 403) {
                toast.error("Error");
            }
        });
    };

    const handleUpdateStatus = async (recipeId, status) => {
        const data = {
            recipe_item_id: recipeId,
            status: status,
        };

        const fetchApi = putApi("/recipeDetail", decryptedToken, data);

        await fetchApi.then((res) => {
            if (res.status === 200) {
                toast.success(res.data.message);
            }
            if (res.status === 403) {
                toast.error("Error");
            }
        });

        handleRefresh();
    }
    
    const handleShowModal = () => {
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    }

    const columns = [
        {
            name: "rowNumber",
            label: "#",
            options: {
                filter: false,
                sort: false,
                customBodyRender: (value, tableMeta) => (
                <span>{tableMeta.rowIndex + 1}</span>
                ),
            },
        },
        {
            name: "product_name",
            label: "Ingredient Name",
            options: {
                filter: true,
                sort: true,
            }
        },
        {
            name: "unit_qty",
            label: "Unit",
            options: {
                filter: true,
                sort: true,
                customBodyRender: (value, tableMeta, updateValue) => (
                    <span>
                        1 {recipeDetail[0][tableMeta.rowIndex]?.is_weight === true ?
                            "g" :
                            recipeDetail[0][tableMeta.rowIndex]?.packaging_type_name
                        }
                    </span>   
                )
            }
        },
        {
            name: "is_weight",
            label: "Measured by Weight",
            options: {
                filter: true,
                sort: true,
                customBodyRender: (value, tableMeta, updateValue) => {
					if (recipeDetail[0][tableMeta.rowIndex]?.is_weight === true) {
						return (
							<Badge bg="success">
								Yes
							</Badge>
						);
					} else {
						return (
							<Badge bg="danger">
								No
							</Badge>
						);
					}
				}
            }
        },
        {
            name: "buy_price",
            label: "Unit Price",
            options: {
                filter: true,
                sort: true,
            }
        },
        {
            name: "recipe_item_status",
            label: "Status",
            options: {
                filter: true,
                sort: true,
                customBodyRender: (value, tableMeta, updateValue) => {
					if (recipeDetail[0][tableMeta.rowIndex]?.recipe_item_status === true) {
						return (
							<Badge bg="success">
								Active
							</Badge>
						);
					} else {
						return (
							<Badge bg="danger">
								Inactive
							</Badge>
						);
					}
				}
            }
        },
        {
            name: "action",
            label: "Action",
            options: {
                filter: false,
                sort: false,
                customBodyRender: (value, tableMeta, updateValue) => (
                    <>
                        <Button
                            variant={recipeDetail[0][tableMeta.rowIndex]?.recipe_item_status === true
                                ? "danger" : "success"
                            }
                            onClick={() => handleUpdateStatus(
                                recipeDetail[0][tableMeta.rowIndex]?.recipe_item_id,
                                recipeDetail[0][tableMeta.rowIndex]?.recipe_item_status === true ? false : true
                            )}
                        >
                            {recipeDetail[0][tableMeta.rowIndex]?.recipe_item_status === true
                                ? (<FontAwesomeIcon icon={faEyeSlash} />)
                                : (<FontAwesomeIcon icon={faEye} />)
                            }
                        </Button>
                    </>
                )
            }
        }
    ];

    const options = {
        filterType: 'checkbox',
        selectableRows: "none",
        responsive: "standard",
        customToolbar: () => (
            <Button variant="primary" onClick={handleRefresh}>
                <FontAwesomeIcon icon={faSyncAlt} />
            </Button>
        ),
    };

    const handleSubmit = async () => {
        const data = {
            original_price: productPrice,
            recipe_group_id: recipe_group_id,
        };

        const postData = postApi(
            '/recipePrice',
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
        setShowModal(false);
    }

    return (
        <>
            {(recipeDetail.length > 0 && recipeDetail[0][0].original_price) && (
                <h4>Each Product Price - {recipeDetail[0][0].original_price} MMK</h4>
            )}
            <div className='d-flex justify-content-end'>
                <div>
                    <Button className="mx-4" variant="primary" onClick={handleShowModal}>
                        Assign Sale Price
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
                                Assign Sale Price
                            </Modal.Title>
                        </ModalHeader>
                        <ModalBody>
                            <label>Each Product Price</label>
                            <input
                                type='text'
                                className="form-control w-50"
                                onChange={(e) => setProductPrice(e.target.value)}
                            />
                        </ModalBody>
                        <ModalFooter>
                            <Button variant="primary" onClick={handleSubmit}>
                                Save
                            </Button>
                            <Button variant="secondary" onClick={handleCloseModal}>
                                Close
                            </Button>
                        </ModalFooter>
                    </Modal>
                </div>
                <div>
                    <RecipeModal recipeGroupId={recipeDetail.length > 0 && recipeDetail[0][0]?.recipe_group_id} />
                </div>
            </div>
            <MUIDataTable
                title={recipeDetail.length > 0 &&
                    (recipeDetail[1][0]?.recipeGroup[0].recipe_group_name + " Ingredients")
                }
                data={recipeDetail.length > 0 && recipeDetail[0]}
                columns={columns}
                options={options}
                className="shadow-none"
            />
        </>
    )
}

export async function getServerSideProps(context) {
    const { req, query } = context;
    const token = req.cookies.token;
    const recipeGroupId = query.recipe_group_id || '';
    const fetchApi = getApi("/recipeDetail?recipe_group_id=" + recipeGroupId, token);

    try {
        const res = await fetchApi;

        if (res.status === 200) {
            const recipeDetailData = res.data.result;
            return {
                props: {
                    recipeDetailData,
                },
            };
        } else {
            toast.error(res.data.message);
            return {
                props: {
                    recipeDetailData: [],
                },
            };
        }
    } catch (error) {
        console.error("Error fetching stock data:", error);
        toast.error("Failed to fetch stock data.");

        return {
            props: {
                recipeDetailData: [],
            },
        };
    }
}