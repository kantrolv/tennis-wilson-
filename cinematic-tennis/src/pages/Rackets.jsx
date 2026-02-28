import React from 'react';
import Layout from '../components/layout/Layout';
import RacketCatalog from '../components/sections/RacketCatalog';
import { Loader } from "../components/Loader";

const Rackets = () => {
    return (
        <div style={{ backgroundColor: '#F7F7F5', minHeight: '100vh' }}>
            <Layout>
                {/* Catalog handles its own padding/layout styling now */}
                <RacketCatalog />
            </Layout>
        </div>
    );
};

export default Rackets;
