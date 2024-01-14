import { convertTimeZone } from '../../../utils';
import useTranslation from 'next-translate/useTranslation';
import MUIDataTable from "mui-datatables";
import { getApi } from '../../../utils/api';
import { convertLocaleTimeString } from '../../../utils';
import Badge from 'react-bootstrap/Badge';
import EditUserModal from '../../Model/editUserModal';
import AddUserModal from '../../Model/addUserModal';
import { toast } from 'react-toastify';
import jsCookie from 'js-cookie';
import { useState, useEffect } from 'react';
import { decryptData } from '../../../utils/crypto';

export default  function UserTable({userList}) {
	const { t } = useTranslation('common');
	const [updatedUserList, setUpdatedUserList] = useState(userList);

	const fetchUpdatedData = async () => {
		const token = jsCookie.get("token");
		const decryptedToken = decryptData(token);
		const fetchApi = getApi(`/getUsers`, decryptedToken);

		try {
			const res = await fetchApi;

			if (res.status === 200) {
				const updatedList = res.data.result;
				setUpdatedUserList(updatedList);
			} else {
				toast.error(res.data.message);
				setUpdatedUserList([]);
			}
		} catch (error) {
			console.error("Error fetching user data:", error);
			toast.error("Failed to fetch user data.");

			setUpdatedUserList([]);
		}
	};

	const handleCloseUserModal = () => {
		fetchUpdatedData();
    };

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
			name: "user_name",
			label: "User Name",
			options: {
				filter: true,
				sort: true,
			}
		},
		{
			name: "status",
			label: "Status",
			options: {
				filter: true,
				sort: true,
				customBodyRender: (value, tableMeta, updateValue) => {
					if (updatedUserList[tableMeta.rowIndex]?.status === true) {
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
			name: "created_at",
			label: "Created At",
			options: {
				filter: true,
				sort: true,
				customBodyRender: (value, tableMeta, updateValue) => (
					convertTimeZone(updatedUserList[tableMeta.rowIndex]?.created_at)
					+ ' ' +
					convertLocaleTimeString(updatedUserList[tableMeta.rowIndex]?.created_at)
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
					updatedUserList[tableMeta.rowIndex]?.updated_at !== null ?
					convertTimeZone(updatedUserList[tableMeta.rowIndex]?.updated_at)
					+ ' ' +
					convertLocaleTimeString(updatedUserList[tableMeta.rowIndex]?.updated_at)
					: ''
				)
			}
		},
		{
			name: "show_more",
			label: "Action",
			options: {
				filter: false,
				sort: false,
				customBodyRender: (value, tableMeta, updateValue) => (
					<EditUserModal
						user_id={updatedUserList[tableMeta.rowIndex]?.user_id}
						onClose={handleCloseUserModal}
					/>
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
		<div className="mt-2">
			{
				updatedUserList?.length > 0 && (
					<>
						<div className="my-3">
							<AddUserModal onClose={handleCloseUserModal} />
						</div>
						<MUIDataTable
							data={updatedUserList}
							columns={columns}
							options={options}
							className="shadow-none"
						/>
					</>
				)
			}
		</div>
	);
}