import StatusCard from "../../components/cards/statusCard";
import SaleTable from "../../components/layout/sale/SaleTable";
import SaleForm from "../../components/layout/sale/SaleForm";
import useTranslation from "next-translate/useTranslation";

export default function Sales() {
    const { t } = useTranslation("common");

    const statusCardArr = [
        {
            title: t('card.top_customer'),
            value: "Mechanical Keyboard",
            color: "#DC3444",
            type: "dangerCard",
        },
        {
            title: t('card.monthly_sale'),
            value: "10,000,000 Ks",
            color: "#FFC007",
            type: "warningCard",
        },
        {
            title: t('card.top_item'),
            value: "KKB Poe Ti",
            color: "#037BFE",
            type: "infoCard",
        },
    ];

    return (
        <div className="container-fluid">
            <div className="row">
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
                <div
                    className="btn-group mt-4"
                    role="group"
                    aria-label="Basic radio toggle button group"
                >
                    <input
                        type="radio"
                        className="btn-check"
                        name="btnradio"
                        id="btnradio1"
                        autoComplete="off"
                    />
                    <label className="btn btn-outline-primary" htmlFor="btnradio1">
                        {t('sale.sale')}
                    </label>

                    <input
                        type="radio"
                        className="btn-check"
                        name="btnradio"
                        id="btnradio2"
                        autoComplete="off"
                    />
                    <label className="btn btn-outline-primary" htmlFor="btnradio2">
                        {t('sale.deli')}
                    </label>

                    <input
                        type="radio"
                        className="btn-check"
                        name="btnradio"
                        id="btnradio3"
                        autoComplete="off"
                    />
                    <label className="btn btn-outline-primary" htmlFor="btnradio3">
                        {t('sale.return')}
                    </label>
                </div>
                <div className="container-fluid bg-white rounded mt-4 pt-4 pb-4">
                    <SaleForm />
                    <SaleTable />
                </div>
            </div>
        </div>
    );
}
