import { toast } from "react-toastify";
import { useEffect, useState, useCallback } from "react";
import { getApi } from "../../../utils/api";
import { Spinner } from "../../Spinner";
import jsCookie from "js-cookie";
// import CustomTable from "../../CustomTable";
import { TruncateFuncWithTooltip } from "../../../utils/truncate";
import { convertTimeZone } from "../../../utils";
import useTranslation from "next-translate/useTranslation";
import { collapseTextChangeRangesAcrossMultipleVersions } from "typescript";

function SaleTable(props) {
    const { t } = useTranslation("common");
    const [loading, setLoading] = useState(false);
    const [stockArr, setStockArr] = useState([]);

    const columns = [
        {
            dataField: "index",
            text: `${t("table_number")}`,
            sort: true,
            editable: false,
        },
        {
            dataField: "product_name",
            text: `${t("table_product_name")}`,
            sort: true,
        },
        {
            dataField: "product_id",
            text: `${t("table_product_code")}`,
            sort: true,
        },
        {
            dataField: "cat_id",
            text: `${t("table_category")}`,
            sort: true,
        },
        {
            dataField: "product_unit",
            text: `${t("table_purchase_qty")}`,
            sort: true,
        },
        {
            dataField: "general_price",
            text: `${t("table_purchase_price")}`,
            sort: true,
        },
        {
            dataField: "general_price",
            text: `${t("table_sale_price")}`,
            sort: true,
        },
        {
            dataField: "updated_at",
            text: `${t("table_updated_at")}`,
            sort: true,
        },
        {
            dataField: "status",
            text: `${t("table_stock_status")}`,
            sort: true,
        },
    ];

    // let token;
    // const getStockData = useCallback(async () => {
    //     token = localStorage.getItem('token')
    //     setLoading(true);

    //     const fetchApi = await getApi('/stock/product', token);
    //     console.log("Res:>", fetchApi.res)
    //     await fetchApi.then((res) => {
    //         console.log("Res :>", res.data)
    //         if (res.status === 200) {
    //             console.log(res.data.result)
    //             setStockArr(res.data.result);
    //         }
    //     }).catch((err) => {
    //         toast.error(err.response.data.message);
    //     });

    //     setLoading(false);
    // }, [token]);

    // // add number count into stockArr
    // const addIndex = useCallback((stockArr) => {
    //     // console.log("Stock Arr :", stockArr)
    //     return [{
    //         index: 1,
    //         qty: 12
    //     }]
    // }, []);

    // const products = addIndex(stockArr);

    // useEffect(() => {
    //     getStockData();
    // }, [getStockData]);

    const products = [
        {
            index: 1,
            product_id: "0ce22ab7-7407-472e-a08e-6f6587407f42",
            product_name: "Pizza",
            product_unit: 1,
            created_at: "2023-01-17T14:42:04.428194+06:30",
            updated_at: "2023-01-17T14:42:04.428194+06:30",
            user_id: "81da2d01-aa8f-4b2b-a57b-ca617b0b9ceb",
            price_id: "022c3560-5dd1-41a9-98c7-6a83dada5e00",
            general_price: 100,
            channel_id: "yn",
            cat_id: "24d6bb56-b456-4b95-8b16-50eaef0c019b",
            status: "Stock",
        },
    ];

    return (
        <div>
            {loading ? (
                <Spinner />
            ) : (
                <div>
                    {/* <CustomTable
                        products={products}
                        columns={columns}
                        api="/stock/product"
                        method="put"
                    /> */}
                </div>
            )}
        </div>
    );
}

export default SaleTable;
