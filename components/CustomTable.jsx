import { useState } from "react";
import ToolkitProvider, { Search } from "react-bootstrap-table2-toolkit";
import paginationFactory from "react-bootstrap-table2-paginator";
import BootstrapTable from "react-bootstrap-table-next";
import cellEditFactory from "react-bootstrap-table2-editor";
import {
    paginationSize,
    pageStartIndex,
    firstPageText,
    prePageText,
    nextPageText,
    lastPageText,
    nextPageTitle,
    prePageTitle,
    firstPageTitle,
    lastPageTitle,
    showTotal,
    disablePageTitle,
    sizePerPageListObj_1,
    sizePerPageListObj_2,
    customTotal,
} from "../utils/constants";
import { putApi } from "../utils/api";
import jsCookie from "js-cookie";
import { toast } from "react-toastify";
import dynamic from "next/dynamic";
const LineChart = dynamic(() => import("./chart/LineChart"), {
    ssr: false,
});
import Model from "./Model/index";

export default function CustomTable({ products, columns }) {
    const { SearchBar } = Search;
    const token = jsCookie.get("token");
    const [showChartModel, setShowChartModel] = useState();

    const openChartModel = () => {
        setShowChartModel(true);
    };

    const closeChartModel = () => {
        setShowChartModel(false);
    };

    const options = {
        paginationSize: paginationSize,
        pageStartIndex: pageStartIndex,
        firstPageText: firstPageText.toString(),
        prePageText: prePageText.toString(),
        nextPageText: nextPageText.toString(),
        lastPageText: lastPageText.toString(),
        nextPageTitle: nextPageTitle.toString(),
        prePageTitle: prePageTitle.toString(),
        firstPageTitle: firstPageTitle.toString(),
        lastPageTitle: lastPageTitle.toString(),
        showTotal: showTotal,
        paginationTotalRenderer: customTotal,
        disablePageTitle: disablePageTitle,
        sizePerPageList: [
            sizePerPageListObj_1,
            sizePerPageListObj_2,
            {
                text: "All",
                value: products?.length,
            },
        ],
    };

    function afterSaveCell(oldValue, newValue, row, column) {
        setTimeout(() => {
            const data = {
                purchase_id: row.purchase_id_1,
                purchase_bill_id: row.purchase_bill_id_1,
                purchase_shop_id: row.purchase_shop_id,
                purchase_shop_name: row.shop_name,
                product_id: row.product_id,
                product_stock_id: row.product_stock_id,
                balance_id: row.balance_id,
                balance_type_id: row.balance_type_id,
                purchase_type_id: row.purchase_type_id,
                purchase_type_name: row.purchase_type_name,
                purchase_type_status: row.purchase_type_status,
                price_id: row.price_id,
                cat_id: row.cat_id,
                cat_name: row.cat_name,
                packaging_type_id: "3f580539-52e0-41b3-b81c-eded03416957",
                packaging_type_name: "ဖာ",
                price_gp_id: "114e593a-472b-426f-9222-26e4de24c07a",
                price_gp_name: "အေ",
                product_name: row.product_name,
                purchase_qty: row.purchase_qty,
                purchase_unit: row.purchase_unit,
                purchase_total_qty: row.purchase_total_qty,
                product_price: row.product_price,
                purchase_amount: row.purchase_amount,
                balance_type: row.balance_type,
                balance_status: row.balance_status,
                user_id: row.user_id,
                note: row.note_1,
                channel_id: row.channel_id,
                purchase_bill_status: row.purchase_bill_status,
                instock_date: row.instock_date,
            };

            if (confirm("Do you want to accept this change?")) {
                if (row.api === "/purchase/purchase") {
                    const fetchApi = putApi(row.api, token, data);
                    fetchApi.then((res, err) => {
                        if (res.status === 200) {
                            toast.success(res.data.message);
                        }
                    });
                }
            } else {
            }
        }, 0);

        return { async: true };
    }

    const tableRowEvents = {
        onClick: (e, row, rowIndex) => {
            openChartModel();
        },
    };

    return (
        <ToolkitProvider keyField="id" data={products} columns={columns} search>
            {(props) => (
                <div>
                    {/* Chart Model */}
                    <Model showed={showChartModel} closeMode={closeChartModel}>
                        <LineChart />
                    </Model>

                    {/* Table */}
                    <SearchBar {...props.searchProps} />
                    <hr />
                    <BootstrapTable
                        pagination={paginationFactory(options)}
                        {...props.baseProps}
                        wrapperClasses="table-responsive text-nowrap"
                        cellEdit={cellEditFactory({
                            mode: "dbclick",
                            afterSaveCell,
                        })}
                        rowEvents={tableRowEvents}
                    />
                </div>
            )}
        </ToolkitProvider>
    );
}
