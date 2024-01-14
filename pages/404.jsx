import Link from 'next/link';
import useTranslation from 'next-translate/useTranslation';

export default function Custom404() {
    const { t } = useTranslation("common");
    return (
        <div className='container-fluid text-center'>
            <div className='row'>
                <div className='col-12'>
                    <h1 className="my-5">{t('404')}</h1>
                    <Link
                        href='/'
                        className='link text-white'
                    >
                        <button
                            className='btn btn-primary'
                        >
                            {t('back_to_main')}
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
}