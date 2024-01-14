import React from "react";
import Chart from "react-apexcharts";

class LineChart extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            series: [
                {
                    name: "Pizza",
                    data: [
                        100000, 230000, 350000, 500000, 409000, 503000, 690000,
                        910000, 880000,
                    ],
                },
            ],
            options: {
                chart: {
                    height: 1000000,
                    type: "line",
                    zoom: {
                        enabled: false,
                    },
                },
                dataLabels: {
                    enabled: false,
                },
                stroke: {
                    curve: "straight",
                },
                title: {
                    text: "Stock Status by Month",
                    align: "left",
                },
                grid: {
                    row: {
                        colors: ["#f3f3f3", "transparent"], // takes an array which will be repeated on columns
                        opacity: 0.5,
                    },
                },
                xaxis: {
                    categories: [
                        "Jan",
                        "Feb",
                        "Mar",
                        "Apr",
                        "May",
                        "Jun",
                        "Jul",
                        "Aug",
                        "Sep",
                    ],
                },
            },
        };
    }

    render() {
        return (
            <div id="chart">
                <Chart
                    options={this.state.options}
                    series={this.state.series}
                    type="line"
                    height={350}
                />
            </div>
        );
    }
}

export default LineChart;
