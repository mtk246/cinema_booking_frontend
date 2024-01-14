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
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import useTranslation from 'next-translate/useTranslation';
import { decryptData } from '../../../utils/crypto';

const SaleForm = () => {
    const { t } = useTranslation("common");
    const token = jsCookie.get('token');
    const decryptedToken = decryptData(token);
    const [showModal, setShowModal] = useState(false);
    const [purchaseDetailData, setPurchaseDetailData] = useState([]);
    const [purchaseDetails, setPurchaseDetails] = useState(
        {
            "purchase_shop_id": "",
            "purchase_note": "",
            "purchase_bill_status": "",
            "purchase_type_id": "",
            "purchase_detail_arr": [],
        }
    );
    const [purchaseDetailsArr, setPurchaseDetailsArr] = useState([]);
    const [loading, setLoading] = useState(false);
    const uniqueShopIds = [...new Set(purchaseDetailData.map(item => item.purchase_shop_id))];
    const uniquePurchaseTypeIds = [...new Set(purchaseDetailData.map(item => item.purchase_type_id))];

    const colourOptions = [
        { value: 'chocolate', label: 'Chocolate' },
        { value: 'strawberry', label: 'Strawberry' },
        { value: 'vanilla', label: 'Vanilla' },
    ];

    function handleAddRow() {
        const newRow = {
            product_name: "",
            init_product_unit: 1,
            init_product_qty: 0,
            total_product_unit: 0,
            cat_id: "",
            packaging_type_id: "",
            price_gp_id: "",
            balance_type_id: "",
            buy_price: 0,
            sell_price: 0,
            balance_note: "",
            outstanding_amount: 0,
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
        setPurchaseDetailsArr(updatedRows);
    }

    async function handleSubmit() {
        setLoading(true);

        purchaseDetails.purchase_detail_arr = purchaseDetailsArr;

        const postData = postApi(
            '/purchase/detail',
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

        setLoading(false);
        setShowModal(false);
    }

    const handleKeyDown = useCallback((event) => {
        if (event.shiftKey && event.key.toLowerCase() === "n") {
            event.preventDefault();
            handleShowModal();
        }
    },[]);

    const handleChange = (event) => {
        setPurchaseDetails((prevPurchaseDetails => ({
            ...prevPurchaseDetails,
            "purchase_shop_id": event.target.value
        })));
    };

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
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    const handleRefresh = useCallback(async () => {
        setLoading(true);

        const fetchApi = getApi("/purchase/detail/purchase", decryptedToken);

        await fetchApi.then((res) => {
            if (res.status === 200) {
                setPurchaseDetailData(res.data.result);
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
                {t('create')}
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
                        {t('sale.create_sale')}
                    </Modal.Title>
                </ModalHeader>
                <ModalBody>
                    <form className="">
                        <div className="row text-center text-md-start">
                            <div className="col-12 col-sm-6 col-md-4 col-lg-3">
                                <CreatableSelect
                                    options={colourOptions}
                                    className="custom-select my-2"
                                    placeholder={t('sale.customer_name')}
                                />
                            </div>
                            <div className="col-12 col-sm-6 col-md-4 col-lg-3">
                                <FormControl sx={{ m: 1, minWidth: 200 }}>
                                    <InputLabel id="demo-simple-select-helper-label">{t('sale.type')}</InputLabel>
                                    <Select
                                        labelId="demo-simple-select-helper-label"
                                        id="demo-simple-select-helper"
                                        value={purchaseDetails.purchase_type_id}
                                        label={t('sale.type')}
                                        onChange={handlePurchaseTypeChange}
                                        autoWidth
                                    >
                                        {
                                            uniquePurchaseTypeIds.map((purchaseTypeId, index) => {
                                                const purchase_type = purchaseDetailData.find(
                                                    (item) => item.purchase_type_id === purchaseTypeId
                                                );
                                                return (
                                                    <MenuItem
                                                        key={purchase_type.purchase_type_id}
                                                        value={purchase_type.purchase_type_id}
                                                    >
                                                        {purchase_type.purchase_type_name}
                                                    </MenuItem>
                                                );
                                            })
                                        }
                                    </Select>
                                </FormControl>
                            </div>
                            <div className="col-12 col-sm-6 col-md-4 col-lg-3">
                                <FormControl sx={{ m: 1, minWidth: 200 }}>
                                    <InputLabel id="demo-simple-select-helper-label">{t('sale.payment')}</InputLabel>
                                    <Select
                                        labelId="demo-simple-select-helper-label"
                                        id="demo-simple-select-helper"
                                        value={purchaseDetails.purchase_bill_status}
                                        label={t('sale.payment')}
                                        onChange={handleBillStatusChange}
                                        autoWidth
                                    >
                                        <MenuItem value="">
                                            <em>None</em>
                                        </MenuItem>
                                        <MenuItem value="Unpaid">Unpaid</MenuItem>
                                        <MenuItem value="Paid">Paid</MenuItem>
                                    </Select>
                                </FormControl>
                            </div>
                        </div>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                <TableRow>
                                    <TableCell>{t('table.shop_name')}</TableCell>
                                    <TableCell>{t('table.product_name')}</TableCell>
                                    <TableCell>{t('table.initial_product_unit')}</TableCell>
                                    <TableCell>{t('table.initial_product_qty')}</TableCell>
                                    <TableCell>{t('table.total_unit')}</TableCell>
                                    <TableCell>{t('table.total_qty')}</TableCell>
                                    <TableCell>{t('table.price_gp')}</TableCell>
                                    <TableCell>{t('table.unit_price')}</TableCell>
                                    <TableCell>{t('table.total_amt')}</TableCell>
                                    <TableCell>{t('table.outstanding_amount')}</TableCell>
                                    <TableCell></TableCell>
                                </TableRow>
                                </TableHead>
                                <TableBody>
                                {purchaseDetailsArr.map((row, index) => (
                                    <TableRow key={index}>
                                        <TableCell>
                                            <FormControl sx={{ m: 1, minWidth: 80 }}>
                                                <InputLabel id="demo-simple-select-helper-label">Shop Name</InputLabel>
                                                <Select
                                                    labelId="demo-simple-select-helper-label"
                                                    id="demo-simple-select-helper"
                                                    value={purchaseDetails.purchase_shop_id}
                                                    label="Shop Name"
                                                    onChange={handleChange}
                                                    
                                                >
                                                    {
                                                        uniqueShopIds.map((shopId, index) => {
                                                            const shop = purchaseDetailData.find(
                                                                item => item.purchase_shop_id === shopId
                                                            );
                                                            return (
                                                                <MenuItem
                                                                    key={shop.purchase_shop_id}
                                                                    value={shop.purchase_shop_id}
                                                                >
                                                                    {shop.shop_name}
                                                                </MenuItem>
                                                            );
                                                        })
                                                    }
                                                </Select>
                                            </FormControl>
                                        </TableCell>
                                        <TableCell>
                                            <FormControl sx={{ m: 1, minWidth: 80 }}>
                                                <InputLabel id="demo-simple-select-helper-label">
                                                    Product Name
                                                </InputLabel>
                                                <Select
                                                    labelId="demo-simple-select-helper-label"
                                                    id="demo-simple-select-helper"
                                                    value={purchaseDetails.purchase_shop_id}
                                                    label="Product Name"
                                                    onChange={handleChange}
                                                    
                                                >
                                                    {
                                                        uniqueShopIds.map((shopId, index) => {
                                                            const shop = purchaseDetailData.find(
                                                                item => item.purchase_shop_id === shopId
                                                            );
                                                            return (
                                                                <MenuItem
                                                                    key={shop.purchase_shop_id}
                                                                    value={shop.purchase_shop_id}
                                                                >
                                                                    {shop.shop_name}
                                                                </MenuItem>
                                                            );
                                                        })
                                                    }
                                                </Select>
                                            </FormControl>
                                        </TableCell>
                                        <TableCell>
                                            <input
                                            type="number"
                                            className="form-control"
                                            value={row.init_product_unit}
                                            onChange={(e) =>
                                                handleRowChange(
                                                    index,
                                                    'init_product_unit',
                                                    parseInt(e.target.value)
                                                )
                                            }
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <input
                                            type="number"
                                            className="form-control"
                                            value={row.init_product_qty}
                                            onChange={(e) =>
                                                handleRowChange(
                                                    index,
                                                    'init_product_qty',
                                                    parseInt(e.target.value)
                                                )
                                            }
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <input
                                            type="number"
                                            className="form-control"
                                            value={row.total_product_unit}
                                            onChange={(e) =>
                                                handleRowChange(
                                                    index,
                                                    'total_product_unit',
                                                    parseInt(e.target.value)
                                                )
                                            }
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <input
                                                type="number"
                                                className="form-control"
                                                value={row.sell_price}
                                                onChange={(e) =>
                                                    handleRowChange(
                                                        index,
                                                        'sell_price',
                                                        parseFloat(e.target.value)
                                                    )
                                                }
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <input
                                                type="number"
                                                className="form-control"
                                                value={row.sell_price}
                                                onChange={(e) =>
                                                    handleRowChange(
                                                        index,
                                                        'sell_price',
                                                        parseFloat(e.target.value)
                                                    )
                                                }
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <input
                                                type="number"
                                                className="form-control"
                                                value={row.sell_price}
                                                onChange={(e) =>
                                                    handleRowChange(
                                                        index,
                                                        'sell_price',
                                                        parseFloat(e.target.value)
                                                    )
                                                }
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <input
                                                type="number"
                                                className="form-control"
                                                value={row.sell_price}
                                                onChange={(e) =>
                                                    handleRowChange(
                                                        index,
                                                        'sell_price',
                                                        parseFloat(e.target.value)
                                                    )
                                                }
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <input
                                                type="number"
                                                className="form-control"
                                                value={row.outstanding_amount}
                                                onChange={(e) =>
                                                    handleRowChange(
                                                        index,
                                                        'outstanding_amount',
                                                        parseFloat(e.target.value)
                                                    )
                                                }
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Button variant="danger" onClick={handleDeleteRow}>
                                                <FontAwesomeIcon
                                                    icon={faTrash}
                                                />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <Button className="btn-block my-3" onClick={handleAddRow}>
                            {t('sale.add_new_product')}
                        </Button>
                        <FloatingLabel controlId="floatingTextarea2" label={t('remark')}>
                            <Form.Control
                                as="textarea"
                                placeholder="Leave a comment here"
                            />
                        </FloatingLabel>
                    </form>
                </ModalBody>
                <ModalFooter>
                    { loading
                        ? ( <Spinner />)
                        : (
                            <Button variant="primary" onClick={handleSubmit}>
                                {t('sale.confirm')}
                            </Button>
                        )
                    }
                    <Button variant="secondary" onClick={handleCloseModal}>
                        {t('sale.close')}
                    </Button>
                </ModalFooter>
            </Modal>
        </div>
    )
}

export default SaleForm;