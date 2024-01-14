export default Purchase;
import PurchaseTable from "../../components/layout/purchase_info/PurchaseTable";
import PurchaseForm from "../../components/layout/purchase_info/PurchaseForm";
import useTranslation from "next-translate/useTranslation";
import StatusCard from "../../components/cards/statusCard";
const yaml = require("../../parameters.yml");
import useAuth from "../../middleware/useAuth";
import jsCookie from "js-cookie";
import { decryptData } from "../../utils/crypto";

function Purchase() {
    const { t } = useTranslation("common");
    const user_role = jsCookie.get('role');
    const decryptedUserRole = parseInt(decryptData(user_role));

    useAuth(decryptedUserRole);

    const statusCardArr = [
        {
            title: t('card.top_customer'),
            value: "Mechanical Keyboard",
            color: "#DC3444",
            type: "dangerCard",
        },
        {
            title: "Monthly Sale",
            value: "10,000,000 Ks",
            color: "#FFC007",
            type: "warningCard",
        },
        {
            title: "Top Customer",
            value: "Shwe Hnin Si",
            color: "#037BFE",
            type: "infoCard",
        },
    ];

    return (
        <div>
            <div className="container-fluid p-0">
                {yaml.hide_features ? (
                    <div>
                        <h1>Coming Soon</h1>
                    </div>
                ) : (
                    <>
                        {/* <div className="row">
                        {
                            statusCardArr.map((item, index) => (
                                <div className="col-12 col-md-6 col-lg-3" key={index}>
                                    <StatusCard
                                        title={item.title}
                                        value={item.value}
                                        color={item.color}
                                        type={item.type}
                                    />
                                </div>
                            ))
                        }
                        </div> */}
                        <div className="container-fluid bg-white rounded mt-4 pt-4 pb-4">
                            <PurchaseForm />
                            <PurchaseTable />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}