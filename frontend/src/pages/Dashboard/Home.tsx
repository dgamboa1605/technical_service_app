import RecentOrders from "../../components/ecommerce/RecentOrders";
import PageMeta from "../../components/common/PageMeta";

export default function Home() {
    return (
        <>
            <PageMeta
                title="Dashboard - Technical Service"
                description="This will display the dashboard for the technical service application."
            />
            <div className="grid grid-cols-12 gap-4 md:gap-6">

                <div className="col-span-12 xl:col-span-12">
                    <RecentOrders />
                </div>
            </div>
        </>
    );
}
