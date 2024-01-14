import { useEffect, useState, useCallback } from "react";
import { useRouter } from 'next/router';
import { getApi, postApi, putApi } from '../../utils/api';
import { formatDate } from '../../utils';
import jsCookie from 'js-cookie';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCheck,
    faTimes,
    faArrowAltCircleLeft,
} from '@fortawesome/free-solid-svg-icons';
import { toast } from "react-toastify";
import useTranslation from "next-translate/useTranslation";
import Table from 'react-bootstrap/Table';
import EasyEdit, { Types } from "react-easy-edit";
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import DigitalClock from "../../components/layout/digital_clock/design2";
import Link from 'next/link';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import moment from 'moment';
import 'moment-timezone';
import { Spinner } from "../../components";
import { decryptData } from "../../utils/crypto";

export default function RecipeDetail() {
    const router = useRouter();
    const {t} = useTranslation('common');
    const token = jsCookie.get('token');
    const decryptedToken = decryptData(token);
    const user_id = jsCookie.get('user_id');
    const role = jsCookie.get('role');
    const decryptedRole = parseInt(decryptData(role));
    const {recipe_group_id} = router.query;
    const [recipeDetail, setRecipeDetail] = useState([]);
    const [result, setResult] = useState(0);
    const [date, setDate] = useState('today');
    const [loading, setLoading] = useState(false);

    const handleDateChange = (value) => {
        let selectedDate;

        if (moment.isMoment(value)) {
            selectedDate = value.toDate();
        } else if (typeof value === 'object' && value.hasOwnProperty('$d')) {
            selectedDate = value.$d;
        }

        if (selectedDate) {
            const formattedDate = formatDate(selectedDate);
            setDate(formattedDate);
            handleRefresh(formattedDate);
        }
    };

    const handleChange = (event) => {
        const selectedDate = event.target.value;
        setDate(selectedDate);
        handleRefresh(selectedDate);
    };

    const onSave = async (
        recipeGroupId,
        value,
        recipeItemId,
        isWeight,
        productionId,
        productId,
        stockListHistoryId
    ) => {
        const data = {
            recipe_group_id: recipeGroupId,
            recipe_item_id: recipeItemId,
            actual_weight: parseInt(value),
            actual_quantity: parseInt(value),
            is_weight: isWeight,
            user_id: user_id,
            production_id: productionId === undefined ? "" : productionId,
            product_id: productId === null ? "" : productId,
            stock_list_history_id: stockListHistoryId,
        };

        const fetchApi = postApi('/production', decryptedToken, data);
    
        await fetchApi.then((res) => {
            if (res.status === 200) {
                if (date !== 'today' && date !== 'yesterday') {
                    const parsedDate  = moment(date, "ddd MMM DD YYYY HH:mm:ss");
                    const convertedDate = parsedDate.tz('Asia/Yangon').format('YYYY-MM-DD HH:mm:ss.SSSZ');
                    handleRefresh(convertedDate);
                } else {
                    handleRefresh(date);
                }

                toast.success(res.data.message);
            } else {
                toast.error('Error');
            }
        });
    };

    const onPacketUpdate = async (productionId, value) => {
        const data = {
            production_id: productionId,
            unit_qty: value,
        };

        const fetchApi = putApi('/productionQty', decryptedToken, data);
    
        await fetchApi.then((res) => {
            if (res.status === 200) {
                if (date !== 'today' && date !== 'yesterday') {
                    handleRefresh(date);
                } else {
                    handleRefresh(date);
                }

                toast.success(res.data.message);
            } else {
                toast.error('Error');
            }
        });
    }

    const onTotalPacketUpdate = async (productionId, value) => {
        const data = {
            production_id: productionId,
            total_qty: value,
        };

        const fetchApi = putApi('/onTotalPacketUpdate', decryptedToken, data);
    
        await fetchApi.then((res) => {
            if (res.status === 200) {
                if (date !== 'today' && date !== 'yesterday') {
                    handleRefresh(date);
                } else {
                    handleRefresh(date);
                }

                toast.success(res.data.message);
            } else {
                toast.error('Error');
            }
        });
    }

    const handleRefresh = useCallback(async (selectedDate) => {
        // setLoading(true);

        if (recipe_group_id) {
            let apiUrl = "/production?recipe_group_id=" + recipe_group_id;

            if (selectedDate === "today" || selectedDate === "" || selectedDate === undefined) {
                apiUrl += "&start_date=today";
            } else if (selectedDate === "yesterday") {
                apiUrl += "&start_date=yesterday";
            } else {
                const startDate = selectedDate;
                apiUrl += `&start_date=${startDate}`;
            }

            const fetchApi = getApi(apiUrl, decryptedToken);
      
            await fetchApi.then((res) => {
                if (res.status === 200) {
                    setRecipeDetail(res.data);
                    if (res.data.length > 0) {
                        let sum = 0;

                        res.data[0]?.forEach((item) => {
                            if (item.production.length > 0) {
                                sum += item.is_weight === true
                                ? item.production[0]?.actual_weight / item.buy_price
                                : item.production[0]?.actual_quantity / item.buy_price;
                            } else {
                                sum = 0;
                            }
                        });
    
                        setResult(sum.toFixed(3));
                    }
                }
                if (res.status === 403) {
                    toast.error("Error");
                }
            });
        }

        // setLoading(false);
    }, [decryptedToken, recipe_group_id]);

    useEffect(() => {
        handleRefresh();
    },[handleRefresh, recipe_group_id]);

    return (
        <div className="bg-white p-2">
            <>
                <div className="">
                    <Link href="/production" className="btn btn-primary">
                        <FontAwesomeIcon icon={faArrowAltCircleLeft} className="px-1" /> Production Page
                    </Link>
                </div>
                <div className="row">
                    <div className="col-12 col-md-6">
                        <DigitalClock date={date} />
                    </div>
                    <div className="col-12 col-md-6">
                        <FormControl className="w-50">
                            <InputLabel id="demo-simple-select-label">Date</InputLabel>
                            <Select
                                labelId="demo-simple-select-label"
                                id="demo-simple-select"
                                value={date}
                                label="Date"
                                onChange={handleChange}
                                className="mx-2"
                            >
                                <MenuItem value="today">Today</MenuItem>
                                <MenuItem value="yesterday">Yesterday</MenuItem>
                            </Select>
                        </FormControl>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                                label="Choose a date"
                                onChange={(newValue) => handleDateChange(newValue)}
                                className="w-50"
                            />
                        </LocalizationProvider>
                    </div>
                </div>
                {loading ? (<Spinner />) : (
                    <>
                        <h3 className="my-5">
                            {recipeDetail.length > 0 &&
                                (recipeDetail[1][0]?.recipeGroup[0]?.recipe_group_name + " Ingredients")
                            }
                        </h3>
                        <Table responsive borderless>
                            <tbody>
                                {
                                    recipeDetail.length > 0 &&
                                        recipeDetail[0].map((item, index) => {
                                            return (
                                                <tr key={index} className="h4">
                                                    <td className="text-start">
                                                        {item.product_name}
                                                    </td>
                                                    <td className="text-start">
                                                        <div className="d-flex flex-row align-items-center">
                                                            <EasyEdit
                                                                type={Types.NUMBER}
                                                                value={
                                                                    item.production.length > 0 ? (
                                                                        item.production[0]?.is_weight === true
                                                                            ? item.production[0]?.actual_weight
                                                                            : item.production[0]?.actual_quantity
                                                                    ) : t('write')
                                                                }
                                                                onSave={(value) => onSave(
                                                                    item.recipe_group_id,
                                                                    value,
                                                                    item.recipe_item_id,
                                                                    item.is_weight,
                                                                    item.productionId[0]?.production_id,
                                                                    item.product_id,
                                                                    item.stocklist_history_id,
                                                                )}
                                                                saveButtonLabel={
                                                                    <FontAwesomeIcon
                                                                        icon={faCheck}
                                                                        className="text-success"
                                                                    />
                                                                }
                                                                cancelButtonLabel={
                                                                    <FontAwesomeIcon
                                                                        icon={faTimes}
                                                                        className="text-danger"
                                                                    />
                                                                }
                                                            />
                                                            <span className="mx-3 text-muted">
                                                                {item.is_weight ? "g" : item.packaging_type_name}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    {decryptedRole !== 2 && (
                                                        <td className="text-start">
                                                            {item.production.length > 0 ? (
                                                                item.is_weight === true ? (
                                                                    item.production[0]?.actual_weight / item.buy_price
                                                                ) : (
                                                                    item.production[0]?.actual_quantity / item.buy_price
                                                                )
                                                            ) : (
                                                                <span>0</span>
                                                            )} <small className="text-muted fw-normal">Kyats</small>
                                                        </td>
                                                    )}
                                                </tr>
                                            )
                                        })
                                }
                            </tbody>
                        </Table>
                        {decryptedRole !== 2 && (
                            <div className="p-3 m-2 rounded shadow bg-custom-primary text-white text-center">
                                <h1 className="h3">
                                    Each Bucket Total Amount: &nbsp;
                                    {result} <small className="fw-normal"> Kyats</small>
                                </h1>
                            </div>
                        )}
                        <hr />
                        {recipeDetail.length > 0 && (
                            <div className="row">
                                <div className="col-12 col-lg-6">
                                    <div
                                        className="row p-3 m-2 rounded shadow bg-light"
                                    >
                                        <div className="col-6">
                                            တစ်အိုးပါဝင်နှုန်း
                                        </div>
                                        <div className="col-6">
                                            <div className="d-flex flex-row align-items-center">
                                                <EasyEdit
                                                    type={Types.NUMBER}
                                                    value={
                                                        recipeDetail[0][0]?.productionId[0]?.unit_qty !== null
                                                        ? recipeDetail[0][0]?.productionId[0]?.unit_qty
                                                        : t('write')
                                                    }
                                                    onSave={(value) => onPacketUpdate(
                                                        recipeDetail[0][0]?.productionId[0]?.production_id,
                                                        value
                                                    )}
                                                    saveButtonLabel={
                                                        <FontAwesomeIcon
                                                            icon={faCheck}
                                                            className="text-success"
                                                        />
                                                    }
                                                    cancelButtonLabel={
                                                        <FontAwesomeIcon
                                                            icon={faTimes}
                                                            className="text-danger"
                                                        />
                                                    }
                                                />
                                                <span className="mx-3 text-muted">
                                                    ထုပ်
                                                </span>
                                            </div>
                                        </div>
                                        <div className="col-6">
                                            စုစုပေါင်း အိုးအရေအတွက်
                                        </div>
                                        <div className="col-6">
                                            <div className="d-flex flex-row align-items-center">
                                                <EasyEdit
                                                    type={Types.NUMBER}
                                                    value={
                                                        recipeDetail[0][0]?.productionId[0]?.total_qty !== null
                                                        ? recipeDetail[0][0]?.productionId[0]?.total_qty
                                                        : t('write')
                                                    }
                                                    onSave={(value) => onTotalPacketUpdate(
                                                        recipeDetail[0][0]?.productionId[0]?.production_id,
                                                        value
                                                    )}
                                                    saveButtonLabel={
                                                        <FontAwesomeIcon
                                                            icon={faCheck}
                                                            className="text-success"
                                                        />
                                                    }
                                                    cancelButtonLabel={
                                                        <FontAwesomeIcon
                                                            icon={faTimes}
                                                            className="text-danger"
                                                        />
                                                    }
                                                />
                                                <span className="mx-3 text-muted">
                                                    အိုး
                                                </span>
                                            </div>
                                        </div>
                                        <div className="col-6">
                                            စုစုပေါင်း အထုပ်ရေ
                                        </div>
                                        <div className="col-6">
                                            <div className="d-flex flex-row align-items-center">
                                                {recipeDetail[0][0]?.productionId[0]?.total_qty *
                                                    recipeDetail[0][0]?.productionId[0]?.unit_qty || 0}
                                                <span className="mx-3 text-muted">
                                                    ထုပ်
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {decryptedRole !== 3 && (
                                    <div className="col-12 col-lg-6">
                                        <div className="row p-3 m-2 rounded shadow bg-light">
                                            <div className="col-6">
                                                တစ်ထုပ်မူရင်းစျေး
                                            </div>
                                            <div className="col-6">
                                                {recipeDetail.length > 0 &&
                                                    recipeDetail[1][0]?.recipeGroup[0]?.original_price
                                                } MMK
                                            </div>
                                            <div className="col-6">
                                                စုစုပေါင်းအထုပ်ရေမူရင်းစျေး
                                            </div>
                                            <div className="col-6">
                                                {recipeDetail.length > 0 &&
                                                    (recipeDetail[1][0]?.recipeGroup[0]?.original_price *
                                                        (recipeDetail[0][0]?.productionId[0]?.total_qty *
                                                        recipeDetail[0][0]?.productionId[0]?.unit_qty)
                                                    ) || 0} MMK
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </>
        </div>
    )
}