import SyncLoader from "react-spinners/SyncLoader";
import useTranslation from "next-translate/useTranslation";

export { Spinner };

function Spinner() {
    const {t} = useTranslation('common');

    return (
        <div className='text-center p-3'>
            <SyncLoader color="#6d7fcc" />
            <span>{t('wait')}</span>
        </div>
    );
}