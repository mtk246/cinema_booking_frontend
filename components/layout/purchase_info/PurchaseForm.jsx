import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { Button, Modal, ModalBody, ModalFooter, ModalHeader, Spinner } from "react-bootstrap";
import { useState, useEffect, useCallback } from "react";
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Form from 'react-bootstrap/Form';
import { getApi, postApi } from '../../../utils/api';
import { toast } from 'react-toastify';
import jsCookie from 'js-cookie';
import CreatableSelect from 'react-select/creatable';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import { decryptData } from '../../../utils/crypto';

const PurchaseForm = () => {
    const token = jsCookie.get('token');
    const decryptedToken = decryptData(token);
    const user_id = jsCookie.get('user_id');
    const [showModal, setShowModal] = useState(false);
    const [purchaseDetailData, setPurchaseDetailData] = useState([]);
    const [purchaseDetails, setPurchaseDetails] = useState(
        {
            "purchase_shop_id": "",
            "purchase_note": "",
            "purchase_bill_status": "",
            "purchase_type_id": "",
            "purchase_detail_arr": [],
            "user_id": "",
        }
    );
    const [category, setCategory] = useState([]);
    const [packaging, setPackaging] = useState([]);
    const [purchaseDetailsArr, setPurchaseDetailsArr] = useState([]);
    const [loading, setLoading] = useState(false);
    const uniquePurchaseTypeIds = purchaseDetailData.length > 0 &&
        [...new Set(purchaseDetailData.map(item => item.purchase_type_id))];
    const uniquePackaging = [...new Set(packaging.map(item => item.packaging_type_id))];
    const [productData, setProductData] = useState({});

    function handleAddRow() {
        const newRow = {
            product_name: "",
            quantity: 0,
            category_id: "",
            packaging_type_id: "",
            is_weight: false,
            weight: 0,
            buy_price: 0,
            sell_price: 0,
            unit_price: 0,
        };
      
        setPurchaseDetailsArr([...purchaseDetailsArr, newRow]);
    }
      
    function handleDeleteRow(index) {
        const updatedRows = [...purchaseDetailsArr];
        updatedRows.splice(index, 1);
        setPurchaseDetailsArr(updatedRows);
    }
      
    function handleRowChange(index, field, value) {
        const updatedRows = [...purchaseDetailsArr];
        updatedRows[index][field] = value;

        if (field === "product_id") {
            const selectedProduct = productData.find(
                (item) => item.product_id === value
            );
      
            if (selectedProduct) {
                updatedRows[index]["is_weight"] = selectedProduct.is_weight;
                updatedRows[index]["weight"] = selectedProduct.total_weight;
                updatedRows[index]["packaging_type_id"] = selectedProduct.packaging_type_id;
                updatedRows[index]["unit_price"] = selectedProduct.unit_price;
            }
        }

        setPurchaseDetailsArr(updatedRows);
    }

    async function handleSubmit() {
        setLoading(true);

        purchaseDetails.purchase_detail_arr = purchaseDetailsArr;
        purchaseDetails.user_id = user_id;

        const postData = postApi(
            '/purchase',
            decryptedToken,
            purchaseDetails,
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
    }

    const handleKeyDown = useCallback((event) => {
        if (event.shiftKey && event.key.toLowerCase() === "n") {
            event.preventDefault();
            handleShowModal();
        }
    },[]);

    const handlePurchaseTypeChange = (event) => {
        setPurchaseDetails((prevPurchaseDetails => ({
            ...prevPurchaseDetails,
            "purchase_type_id": event.target.value
        })));
    }

    const handleBillStatusChange = (event) => {
        setPurchaseDetails((prevPurchaseDetails => ({
            ...prevPurchaseDetails,
            "purchase_bill_status": event.target.value
        })));
    };

    const handleShowModal = () => {
        handleRefresh();
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    const handleRefresh = useCallback(async () => {
        setLoading(true);

        const fetchApi = getApi("/stock", decryptedToken);

        await fetchApi.then((res) => {
            if (res.status === 200) {
                setPurchaseDetailData(res.data?.result.length > 0 && res.data.result);
                setPackaging(res.data.result[1][0]?.packaging);
                setProductData(res.data.result[0]);
            }
            if (res.status === 403) {
                toast.error("Error");
            }
        });

        setLoading(false);
    }, [decryptedToken]);

    useEffect(() => {
        handleRefresh();
        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [handleRefresh, handleKeyDown]);

    return (
        <div className="mb-4 text-end">
            <Button className="w-25" variant="primary" onClick={handleShowModal}>
                Create
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
                        Create Purchase
                    </Modal.Title>
                </ModalHeader>
                <ModalBody>
                    <form className="">
                        <FormControl sx={{ m: 1, minWidth: 120 }}>
                            <InputLabel id="demo-simple-select-helper-label">Purchase Type</InputLabel>
                            <Select
                                labelId="demo-simple-select-helper-label"
                                id="demo-simple-select-helper"
                                value={purchaseDetails.purchase_type_id}
                                label="Purchase Type"
                                onChange={handlePurchaseTypeChange}
                            >
                                {
                                    uniquePurchaseTypeIds &&
                                        uniquePurchaseTypeIds.map((purchaseTypeId, index) => {
                                            const purchase_type = purchaseDetailData.find(
                                                (item) => item.purchase_type_id === purchaseTypeId
                                            );
                                            return (
                                                <MenuItem
                                                    key={index}
                                                    value={purchase_type.purchase_type_id}
                                                >
                                                    {purchase_type.purchase_type_name}
                                                </MenuItem>
                                            );
                                        })
                                }
                            </Select>
                        </FormControl>
                        <FormControl sx={{ m: 1, minWidth: 120 }}>
                            <InputLabel id="demo-simple-select-helper-label">Purchase Bill</InputLabel>
                            <Select
                                labelId="demo-simple-select-helper-label"
                                id="demo-simple-select-helper"
                                value={purchaseDetails.purchase_bill_status}
                                label="Purchase Bill"
                                onChange={handleBillStatusChange}
                            >
                                <MenuItem value="">
                                    <em>None</em>
                                </MenuItem>
                                <MenuItem value="Unpaid">Unpaid</MenuItem>
                                <MenuItem value="Paid">Paid</MenuItem>
                            </Select>
                        </FormControl>
                        <TableContainer>
                            <Table className="custom-table-height">
                                <TableHead>
                                <TableRow>
                                    <TableCell>Product Name</TableCell>
                                    <TableCell>Total Product Unit</TableCell>
                                    <TableCell>Measured by weight</TableCell> 
                                    <TableCell>Weight (g)</TableCell>
                                    <TableCell>Packaging Type ID</TableCell>
                                    <TableCell>Buy Price</TableCell>
                                    <TableCell></TableCell>
                                </TableRow>
                                </TableHead>
                                <TableBody>
                                {purchaseDetailsArr.map((row, index) => (
                                    <TableRow key={index}>
                                        <TableCell>
                                            <CreatableSelect
                                                options={
                                                    purchaseDetailData.length > 0 &&
                                                        purchaseDetailData[0].map((item, index) => {
                                                            return {
                                                                value: item.product_id,
                                                                label: item.product_name
                                                            }
                                                        })
                                                }
                                                className="custom-select my-2"
                                                placeholder="Product Name"
                                                onChange={(e) => 
                                                    handleRowChange(
                                                        index,
                                                        'product_id',
                                                        e.value
                                                    )
                                                }
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <input
                                                type="number"
                                                className="form-control"
                                                value={row.quantity}
                                                onChange={(e) =>
                                                    handleRowChange(
                                                        index,
                                                        'quantity',
                                                        parseInt(e.target.value)
                                                    )
                                                }
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        checked={row.is_weight}
                                                        onChange={(e) =>
                                                            handleRowChange(index, 'is_weight', e.target.checked)
                                                        }
                                                    />
                                                }
                                                label="Measured by weight"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <input
                                                type="number"
                                                className="form-control"
                                                value={row.weight}
                                                onChange={(e) =>
                                                    handleRowChange(
                                                        index,
                                                        'weight',
                                                        parseInt(e.target.value)
                                                    )
                                                }
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <FormControl sx={{ m: 1, minWidth: 120 }}>
                                                <InputLabel id="demo-simple-select-helper-label">
                                                    Packaging Type
                                                </InputLabel>
                                                <Select
                                                    labelId="demo-simple-select-helper-label"
                                                    id="demo-simple-select-helper"
                                                    value={row.packaging_type_id}
                                                    label="Packaging Type"
                                                    onChange={
                                                        (e) => handleRowChange(
                                                            index, 'packaging_type_id', e.target.value
                                                        )}
                                                >
                                                    {
                                                        packaging.length > 0 && (
                                                            uniquePackaging.map((packagingTypeId, index) => {
                                                                const pTypeId = packaging.find(
                                                                        (item) =>
                                                                            item.packaging_type_id === packagingTypeId
                                                                    );
                                                                return (
                                                                    <MenuItem
                                                                        key={index}
                                                                        value={pTypeId?.packaging_type_id}
                                                                    >
                                                                        {pTypeId?.packaging_type_name}
                                                                    </MenuItem>
                                                                );
                                                            })
                                                        )
                                                    }
                                                </Select>
                                            </FormControl>
                                        </TableCell>
                                        <TableCell>
                                            <input
                                                type="number"
                                                className="form-control"
                                                value={row.unit_price}
                                                onChange={(e) =>
                                                    handleRowChange(
                                                        index,
                                                        'unit_price',
                                                        parseFloat(e.target.value)
                                                    )
                                                }
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Button variant="danger" onClick={handleDeleteRow}>
                                                Delete
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <Button className="btn-block my-5" onClick={handleAddRow}>
                            Create
                        </Button>
                        <FloatingLabel controlId="floatingTextarea2" label="Comments">
                            <Form.Control
                                as="textarea"
                                placeholder="Leave a comment here"
                                onChange={(e) => setPurchaseDetails({
                                    ...purchaseDetails,
                                    "purchase_note": e.target.value
                                })}
                            />
                        </FloatingLabel>
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
    )
}

export default PurchaseForm;