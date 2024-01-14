import React, {useState} from "react";
import useTranslation from "next-translate/useTranslation";
import { getApi } from "../../utils/api";
import { toast } from "react-toastify";
import MUIDataTable from "mui-datatables";
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from "react-bootstrap";
import Link from "next/link";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faSyncAlt,
    faEdit,
} from '@fortawesome/free-solid-svg-icons';
import jsCookie from 'js-cookie';
import { decryptData } from "../../utils/crypto";

const StockStatus = ({ stockDetail }) => {
  const { t } = useTranslation("common");
  const token = jsCookie.get('token');
  const decryptedToken = decryptData(token);
  const [stockData, setStockData] = useState(stockDetail);
  const [showModal, setShowModal] = useState(false);

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
      label: "Product Name",
      options: {
        filter: true,
        sort: true,
      }
    },
    {
      name: "packaging_type_name",
      label: "Packaging Type",
      options: {
        filter: true,
        sort: true,
      }
    },
    {
      name: "quantity",
      label: "Product Qty",
      options: {
        filter: true,
        sort: true,
      }
    },
    {
      name: "total_weight",
      label: "Total Weight (g)",
      options: {
        filter: true,
        sort: true,
      }
    },
    {
      name: "buy_price",
      label: "Buy Price",
      options: {
        filter: true,
        sort: true,
      }
    },
    {
      name: "action",
      label: "Action",
      options: {
        filter: true,
        sort: true,
        customBodyRender: (value, tableMeta, updateValue) => (
            <Button variant="primary" onClick={handleShowModal}>
              <FontAwesomeIcon icon={faEdit} />
            </Button>
        )
      }
    },
  ];

  const handleShowModal = () => {
    handleRefresh();
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

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

  const handleRefresh = async () => {
    const fetchApi = getApi(`/stock`, decryptedToken);

    await fetchApi.then((res) => {
        if (res.status === 200) {
          setStockData(res.data.result);
        }
        if (res.status === 403) {
            toast.error("Error");
        }
    });
  };

  return (
    <div>
      <Link href="/packaging" className="btn btn-primary my-3">
        Packaging
      </Link>
      <MUIDataTable
        title={"Stock List"}
        data={stockData[0]}
        columns={columns}
        options={options}
        className="shadow-none"
      />
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
                  Hello
              </div>
          </ModalBody>
          <ModalFooter>
              <Button variant="secondary" onClick={handleCloseModal}>
                  Close
              </Button>
          </ModalFooter>
      </Modal>
    </div>
  );
};

export async function getServerSideProps({ req }) {
    const token = req.cookies.token;
    const decryptedToken = decryptData(token);
    const fetchApi = getApi(`/stock`, decryptedToken);

    try {
        const res = await fetchApi;

        if (res.status === 200) {
            const stockDetail = res.data.result;
            return {
                props: {
                  stockDetail,
                },
            };
        } else {
            toast.error(res.data.message);
            return {
                props: {
                  stockDetail: [],
                },
            };
        }
    } catch (error) {
        console.error("Error fetching stock data:", error);
        toast.error("Failed to fetch stock data.");

        return {
            props: {
              stockDetail: [],
            },
        };
    }
}

export default StockStatus;
