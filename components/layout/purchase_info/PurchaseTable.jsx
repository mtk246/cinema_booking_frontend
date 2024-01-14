export default PurchaseTable;
import { useEffect, useState, useCallback } from 'react';
import { Spinner } from '../../Spinner';
import Link from 'next/link';
import { convertTimeZone, convertLocaleTimeString } from '../../../utils';
import { formatDate } from '../../../utils';
import useTranslation from 'next-translate/useTranslation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faArrowRight
} from '@fortawesome/free-solid-svg-icons';
import MUIDataTable from "mui-datatables";
import { getApi } from '../../../utils/api';
import jsCookie from 'js-cookie';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from "react-bootstrap";
import { decryptData } from '../../../utils/crypto';

function PurchaseTable() {
    const { t } = useTranslation('common');
    const [loading, setLoading] = useState(false);
    const token = jsCookie.get('token');
    const decryptedToken = decryptData(token);
    const [purchaseDetailData, setPurchaseDetailData] = useState([]);
    const [date, setDate] = useState('today');
    const [showModal, setShowModal] = useState(false);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    
    const handleChange = (event) => {
        const selectedDate = event.target.value;
        setDate(selectedDate);
        handleRefresh(selectedDate);
    };
  
    const handleDateChange = (dates) => {
      const [start, end] = dates;
      setStartDate(start);
      setEndDate(end);
    };

    const handleSearch = async () => {
        const dateObj = {
            start_date: formatDate(startDate),
            end_date: formatDate(endDate),
        };

        handleRefresh(dateObj);
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
            name: "purchase_voucher_id",
            label: "Voucher No.",
            options: {
                filter: true,
                sort: true,
            }
        },
        {
            name: "total_amount",
            label: "Total Amount",
            options: {
                filter: true,
                sort: true,
                customBodyRender: (value, tableMeta, updateValue) => (
                    <span>
                        {purchaseDetailData[tableMeta.rowIndex]?.total_amount}
                    </span>
                )
            }
        },
        {
            name: "purchase_type_name",
            label: "Payment Type",
            options: {
                filter: true,
                sort: true,
            }
        },
        {
            name: "added by",
            label: "Added By",
            options: {
                filter: true,
                sort: true,
            }
        },
        {
            name: "purchase_note",
            label: "Note",
            options: {
                filter: true,
                sort: true,
            }
        },
        {
            name: "created_at",
            label: "Created At",
            options: {
                filter: true,
                sort: true,
                customBodyRender: (value, tableMeta, updateValue) => (
                    convertTimeZone(purchaseDetailData[tableMeta.rowIndex]?.created_at)
                    + ' ' +
                    convertLocaleTimeString(purchaseDetailData[tableMeta.rowIndex]?.created_at)
                )
            }
        },
        {
            name: "updated_at",
            label: "Updated At",
            options: {
                filter: true,
                sort: true,
                customBodyRender: (value, tableMeta, updateValue) => (
                    purchaseDetailData[tableMeta.rowIndex]?.updated_at !== null ?
                    convertTimeZone(purchaseDetailData[tableMeta.rowIndex]?.updated_at)
                    + ' ' +
                    convertLocaleTimeString(purchaseDetailData[tableMeta.rowIndex]?.updated_at)
                    : ''
                )
            }
        },
        {
            name: "show_more",
            label: "Show more",
            options: {
                filter: false,
                sort: false,
                customBodyRender: (value, tableMeta, updateValue) => (
                    <Link
                        href={{
                            pathname: '/purchase_detail',
                            query: {
                                purchase_id: purchaseDetailData[tableMeta.rowIndex]?.purchase_id,
                            },
                        }}
                        className='btn btn-primary text-start'
                    >
                        <FontAwesomeIcon icon={faArrowRight} />
                    </Link>
                )
            }
        }
    ];

    const options = {
        filterType: 'checkbox',
        selectableRows: "none",
        responsive: "standard",
        rowsPerPage: 100,
    };

    const handleRefresh = useCallback(async (selectedDate) => {
        setLoading(true);
      
        let apiUrl = "/purchase";
      
        if (selectedDate === "today" || selectedDate === "" || selectedDate === undefined) {
            apiUrl += "?start_date=today";
        } else if (selectedDate === "yesterday") {
            apiUrl += "?start_date=yesterday";
        } else {
            const startDate = selectedDate.start_date;
            const endDate = selectedDate.end_date;
            apiUrl += `?start_date=${startDate}&end_date=${endDate}`;
        }
      
        const fetchApi = getApi(apiUrl, decryptedToken);
      
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
    }, [handleRefresh]);

    const handleShowModal = () => {
        handleRefresh();
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setStartDate(null);
        setEndDate(null);
        setShowModal(false);
    };

    return (
        <div className="">
            <div>
                <div className='d-flex align-items-center'>
                    <FormControl className="w-25">
                        <InputLabel id="demo-simple-select-label">Date</InputLabel>
                        <Select
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            value={date}
                            label="Date"
                            onChange={handleChange}
                        >
                            <MenuItem value="today">Today</MenuItem>
                            <MenuItem value="yesterday">Yesterday</MenuItem>
                        </Select>
                    </FormControl>
                    <div className="mx-2">
                        <Button className="" variant="primary" onClick={handleShowModal}>
                            Choose Date
                        </Button>
                    </div>
                </div>
                <Modal
                    show={showModal}
                    onHide={handleCloseModal}
                    centered
                >
                    <ModalHeader closeButton>
                        <Modal.Title>
                            Date Range
                        </Modal.Title>
                    </ModalHeader>
                    <ModalBody>
                        <div className="text-center">
                            <DatePicker
                                selected={startDate}
                                onChange={handleDateChange}
                                startDate={startDate}
                                endDate={endDate}
                                selectsRange
                                inline
                            />
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        {startDate && endDate && (
                            <Button variant="primary" onClick={handleSearch}>
                                Search
                            </Button>
                        )}
                        <Button variant="secondary" onClick={handleCloseModal}>
                            Close
                        </Button>
                    </ModalFooter>
                </Modal>
                { loading ? (
                    <Spinner/>
                ) : (
                    purchaseDetailData?.length > 0 && (
                        <div>
                            <MUIDataTable
                                data={purchaseDetailData}
                                columns={columns}
                                options={options}
                                className="shadow-none"
                            />
                        </div>
                    )
                )}
            </div>
        </div>
    );
}