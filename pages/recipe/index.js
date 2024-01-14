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
    faArrowRight,
    faSyncAlt,
} from '@fortawesome/free-solid-svg-icons';
import { Button } from "react-bootstrap";
import jsCookie from 'js-cookie';
import { decryptData } from "../../utils/crypto";

const Recipe = ({ RecipeData }) => {
  const { t } = useTranslation("common");
  const token = jsCookie.get('token');
  const decryptedToken = decryptData(token);
  const [recipe, setRecipe] = useState(RecipeData);

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
              convertTimeZone(recipe[tableMeta.rowIndex]?.created_at)
              + ' ' +
              convertLocaleTimeString(recipe[tableMeta.rowIndex]?.created_at)
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
              recipe[tableMeta.rowIndex]?.updated_at !== null ?
                convertTimeZone(recipe[tableMeta.rowIndex]?.updated_at)
                + ' ' +
                convertLocaleTimeString(recipe[tableMeta.rowIndex]?.updated_at)
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
                        pathname: '/recipe_detail',
                        query: {
                          recipe_group_id: recipe[tableMeta.rowIndex]?.recipe_group_id,
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

  const handleRefresh = async () => {
    const fetchApi = getApi(`/recipe`, decryptedToken);

    await fetchApi.then((res) => {
        if (res.status === 200) {
          setRecipe(res.data.result);
        }
        if (res.status === 403) {
            toast.error("Error");
        }
    });
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

  return (
    <div>
      <RecipeModal />
      <MUIDataTable
        title="Recipes"
        data={recipe}
        columns={columns}
        options={options}
        className="shadow-none"
      />
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
            const RecipeData = res.data.result;
            return {
                props: {
                  RecipeData,
                },
            };
        } else {
            toast.error(res.data.message);
            return {
                props: {
                  RecipeData: [],
                },
            };
        }
    } catch (error) {
        console.error("Error fetching stock data:", error);
        toast.error("Failed to fetch stock data.");

        return {
            props: {
              RecipeData: [],
            },
        };
    }
}

export default Recipe;
