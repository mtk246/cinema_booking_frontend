import React, {useState} from "react";
import useTranslation from "next-translate/useTranslation";
import { getApi } from "../../utils/api";
import { toast } from "react-toastify";
import MUIDataTable from "mui-datatables";
import Link from "next/link";
import RecipeModal from "../../components/layout/recipe/RecipeModal";
import { convertTimeZone, convertLocaleTimeString } from '../../utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faArrowRight
} from '@fortawesome/free-solid-svg-icons';
import { decryptData } from "../../utils/crypto";

const Production = ({ stockData }) => {
  const { t } = useTranslation("common");

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
      name: "recipe_group_name",
      label: "Recipe",
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
              convertTimeZone(stockData[tableMeta.rowIndex]?.created_at)
              + ' ' +
              convertLocaleTimeString(stockData[tableMeta.rowIndex]?.created_at)
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
              stockData[tableMeta.rowIndex]?.updated_at !== null ?
                convertTimeZone(stockData[tableMeta.rowIndex]?.updated_at)
                + ' ' +
                convertLocaleTimeString(stockData[tableMeta.rowIndex]?.updated_at)
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
                        pathname: '/production_detail',
                        query: {
                          recipe_group_id: stockData[tableMeta.rowIndex]?.recipe_group_id,
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
  };

  return (
    <div>
      <div className="row">
        {stockData.map((item,index) => {
          return (
            <div className="col-12 col-md-6" key={index}>
              <Link
                className="text-decoration-none text-dark production-card-wrapper"
                href={"/production_detail?recipe_group_id=" + item.recipe_group_id}
              >
                <div className="m-2 border production-card rounded text-center
                  d-flex justify-content-center align-items-center"
                >
                  <h3>{item.recipe_group_name}</h3>
                </div>
              </Link>
            </div>
          )
        })}
      </div>
    </div>
  );
};

export async function getServerSideProps({ req }) {
    const token = req.cookies.token;
    const decryptedToken = decryptData(token);
    const fetchApi = getApi(`/recipe`, decryptedToken);

    try {
        const res = await fetchApi;

        if (res.status === 200) {
            const stockData = res.data.result;
            return {
                props: {
                  stockData,
                },
            };
        } else {
            toast.error(res.data.message);
            return {
                props: {
                    stockData: [],
                },
            };
        }
    } catch (error) {
        console.error("Error fetching stock data:", error);
        toast.error("Failed to fetch stock data.");

        return {
            props: {
                stockData: [],
            },
        };
    }
}

export default Production;
