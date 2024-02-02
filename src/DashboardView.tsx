import React, { useEffect, useState, useRef } from "react";
import Chart, { CategoryScale, ChartConfiguration, ChartData, ChartTypeRegistry, LineController, LineElement, LinearScale, PointElement, Title } from "chart.js/auto";
import firebase from "firebase/compat/app";
import 'firebase/firestore';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { firebaseConfig } from "./firebase-config.ts";
import CalendarWidget from './CalendarWidget.tsx';
import NotificationWidget from './NotificationWidget.tsx';




Chart.register(LineController, CategoryScale, LinearScale, PointElement, LineElement, Title);

interface User {
  email: string;
  metadata: {
    creationTime: string;
    lastSignInTime: string;
    // Other properties...
  };
  userCollege: string;
  userType: string;
  // Other properties...
}



type CustomChartData = ChartConfiguration<'line'>;

const DashboardView = () => {
  const firebaseApp = initializeApp(firebaseConfig);
  const firestore = getFirestore(firebaseApp);
  const [sortingPeriod, setSortingPeriod] = useState<number | null>(null);
  const [userList, setUserList] = useState<User[]>([]);
  const [registeredUsersLast30Days, setRegisteredUsersLast30Days] = useState<User[]>([]);
  const [showChart, setShowChart] = useState(false);
  const [periodLabel, setPeriodLabel] = useState<string>("");
  const prevChartData = useRef<CustomChartData | null>(null);
  const barChartRef = useRef<HTMLCanvasElement>(null);
  const barChartInstance = useRef<Chart<'bar'> | null>(null);

  const [uniqueUsersCount, setUniqueUsersCount] = useState<number>(0);


  const pieChartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart<'pie', number[], string> | null>(null);

  const initialChartData: CustomChartData = {
    type: 'line',
    data: {
      labels: [],
      datasets: [{
        label: "User Registrations",
        data: [],
        fill: false,
        borderColor: "rgba(128, 128, 128, 0.7)",
        tension: 0.4,
      }],
    },
    options: {
      plugins: {
        title: {
          display: true,
          text: 'User Registrations',
          font: {
            size: 18
          }
        },
      },
      responsive: true,
      maintainAspectRatio: false,
    }
  };

  const [chartData, setChartData] = useState<CustomChartData>(initialChartData);
  const chartRef = useRef<Chart<'line'> | null>(null);

  // Fetch all users and organize data by months
  const fetchAllUsers = () => {
    fetch("https://firebase-sdk-admin.onrender.com/api/users")
      .then((response) => response.json())
      .then((data) => {
        const fetchedUsers = data.users || [];

        // Sort the users by creation time (oldest to newest)
        fetchedUsers.sort((a: { metadata: { creationTime: string | number | Date; }; }, b: { metadata: { creationTime: string | number | Date; }; }) => {
          const dateA = new Date(a.metadata.creationTime);
          const dateB = new Date(b.metadata.creationTime);
          return dateA.getTime() - dateB.getTime(); // Ensure proper subtraction for date objects
          const prevChartData = useRef<CustomChartData | null>(null);
        });

        setUserList(fetchedUsers);
        setShowChart(true);

        const registrationsByMonth = fetchedUsers.reduce((acc: Record<string, number>, user: User) => {
          const date = new Date(user.metadata.creationTime);
          const month = date.toLocaleString('default', { month: 'long', year: 'numeric' });
          acc[month] = (acc[month] || 0) + 1;
          return acc;
        }, {});

        const months = Object.keys(registrationsByMonth);
        const userCounts = months.map((month) => registrationsByMonth[month]);

        const newChartData: CustomChartData = {
          type: 'line',
          data: {
            labels: months,
            datasets: [{
              label: 'User Registrations',
              data: userCounts,
              fill: false,
              borderColor: '#A62D38',
              tension: 0.1,
            }],
          },
          options: {
            plugins: {
              title: {
                display: true,
                text: 'User Registrations',
                font: {
                  size: 18,
                },
              },
            },
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  stepSize: 1,
                  precision: 0,
                },
              },
            },
          },
        };

        setChartData(newChartData);
        setPeriodLabel(`Total: ${fetchedUsers.length}`);
      })
      .catch((error) => {
        console.error("Error fetching user data:", error);
      });
  };

  useEffect(() => {
    fetchAllUsers();
  }, []);



  const filterUsersByPeriod = (period: number) => {
    setSortingPeriod(period);
    setShowChart(false);

    const currentDate = new Date();
    const fromDate = new Date();

    if (period === 7) {
      fromDate.setDate(fromDate.getDate() - 7);
      const usersLast7Days = userList.filter((user) => {
        const userCreationDate = new Date(user?.metadata?.creationTime);
        return userCreationDate >= fromDate && userCreationDate <= currentDate;
      }).length;
      setPeriodLabel(`Last 7 Days: ${usersLast7Days}`);
    } else if (period === 30) {
      fromDate.setDate(fromDate.getDate() - 30);
      const usersLast30Days = userList.filter((user) => {
        const userCreationDate = new Date(user?.metadata?.creationTime);
        return userCreationDate >= fromDate && userCreationDate <= currentDate;
      }).length;
      setPeriodLabel(`Last 30 Days: ${usersLast30Days}`);
    } else if (period === 365) {
      fromDate.setFullYear(fromDate.getFullYear() - 1);
      const usersLast12Months = userList.filter((user) => {
        const userCreationDate = new Date(user?.metadata?.creationTime);
        return userCreationDate >= fromDate && userCreationDate <= currentDate;
      }).length;
      setPeriodLabel(`Last 12 Months: ${usersLast12Months}`);
    }

    const filteredUsers = userList.filter((user) => {
      const userCreationDate = new Date(user?.metadata?.creationTime);
      return userCreationDate >= fromDate && userCreationDate <= currentDate;
    });

    setRegisteredUsersLast30Days(filteredUsers);
    setShowChart(true);


    // Update chart data based on the selected period
    const dateLabels: string[] = [];
    const dataPoints: number[] = [];

    for (let d = new Date(fromDate); d <= currentDate; d.setDate(d.getDate() + 1)) {
      dateLabels.push(d.toLocaleDateString());
      const count = filteredUsers.filter(
        (user) => new Date(user.metadata.creationTime).toLocaleDateString() === d.toLocaleDateString()
      ).length;
      dataPoints.push(count);
    }

    setChartData({
      ...chartData,
      data: {
        labels: dateLabels,
        datasets: [
          {
            label: "User Registrations",
            data: dataPoints,
            fill: false,
            borderColor: "#A62D38",
            tension: 0.1,
          },
        ],
      },
      options: {
        plugins: {
          title: {
            display: true,
            text: 'User Registrations',
            font: {
              size: 18
            }
          },
          // Include other plugins if needed
        },
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1,
              precision: 0,
            },
          },
          // Include other scales if needed
        },
        // Add more options as necessary
      },
    });
  };

  useEffect(() => {
    const initializeChart = () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }

      if (showChart && chartData.data.labels && chartData.data.datasets) {
        const canvas = document.getElementById("myChart") as HTMLCanvasElement;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          chartRef.current = new Chart(ctx, {
            type: "line",
            data: chartData.data,
            options: chartData.options || {},
          });
        }
      }
    };

    initializeChart();

    // Clean up function to destroy the chart on unmount
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [chartData, showChart]);




  const handleCardClick = () => {
    fetch("https://firebase-sdk-admin.onrender.com/api/users")
      .then((response) => response.json())
      .then((data) => {
        const fetchedUsers = data.users || [];

        // Sort the users by creation time (oldest to newest)
        fetchedUsers.sort((a: { metadata: { creationTime: string | number | Date; }; }, b: { metadata: { creationTime: string | number | Date; }; }) => {
          const dateA = new Date(a.metadata.creationTime);
          const dateB = new Date(b.metadata.creationTime);
          return dateA.getTime() - dateB.getTime(); // Ensure proper subtraction for date objects
        });

        const registrationsByMonth = fetchedUsers.reduce((acc: Record<string, number>, user: User) => {
          const date = new Date(user.metadata.creationTime);
          const month = date.toLocaleString('default', { month: 'long', year: 'numeric' });
          acc[month] = (acc[month] || 0) + 1;
          return acc;
        }, {});

        const months = Object.keys(registrationsByMonth);
        const userCounts = months.map((month) => registrationsByMonth[month]);

        const newChartData: CustomChartData = {
          type: 'line',
          data: {
            labels: months,
            datasets: [{
              label: 'User Registrations',
              data: userCounts,
              fill: false,
              borderColor: '#A62D38',
              tension: 0.1,
            }],
          },
          options: {
            plugins: {
              title: {
                display: true,
                text: 'User Registrations',
                font: {
                  size: 18,
                },
              },
            },
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  stepSize: 1,
                  precision: 0,
                },
              },
            },
          },
        };

        setChartData(newChartData);
        setPeriodLabel(`Total: ${fetchedUsers.length}`); // Add the "Total Registered Users:" prefix
        setSortingPeriod(null);
      })
      .catch((error) => {
        console.error("Error fetching user data:", error);
      });
  };

  const fetchUserTypes = async () => {
    try {
      const userTypesData: Record<string, number> = {};

      const querySnapshot = await getDocs(collection(firestore, "users"));
      querySnapshot.forEach((doc) => {
        const userType = doc.data().userType;

        if (userTypesData[userType]) {
          userTypesData[userType]++;
        } else {
          userTypesData[userType] = 1;
        }
      });

      const labels = Object.keys(userTypesData);
      const counts = Object.values(userTypesData);

      // Create or update the bar chart
      const barCtx = barChartRef.current?.getContext('2d');
      if (barCtx) {
        if (barChartInstance.current) {
          barChartInstance.current.destroy();
        }

        barChartInstance.current = new Chart(barCtx, {
          type: 'bar',
          data: {
            labels: labels,
            datasets: [
              {
                label: 'User Types',
                data: counts,
                backgroundColor: [
                  'rgba(255, 99, 132, 0.5)',
                  'rgba(54, 162, 235, 0.5)',
                  'rgba(255, 206, 86, 0.5)',
                  // Add more colors as needed
                ],
                borderColor: [
                  'rgba(255, 99, 132, 1)',
                  'rgba(54, 162, 235, 1)',
                  'rgba(255, 206, 86, 1)',
                  // Add more colors as needed
                ],
                borderWidth: 1,
              },
            ],
          },
          options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                  display: false
              },
          },
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  stepSize: 10, // Set the step size for y-axis labels
                  precision: 0,
                },
              },
              x: {
                // Adjustments for x-axis labels
                ticks: {
                  autoSkip: true,
                  maxTicksLimit: 10, // Limit the number of x-axis ticks displayed
                  maxRotation: 0, // Rotate the labels if needed
                },
              },
            },
          },
        });
      }
    } catch (error) {
      console.error("Error fetching user type data:", error);
    }
  };

  useEffect(() => {
    fetchUserTypes();
  }, [firestore]);



  const handleSort = (period: number) => {
    setSortingPeriod(period);
    setPeriodLabel(`${period === 7 ? "Last 7 Days" : period === 30 ? "Last 30 Days" : "Last 12 Months"}: ${registeredUsersLast30Days.length}`);
    // Other logic to filter and update registeredUsersLast30Days and chartData...
  };

  useEffect(() => {
    // Fetch user data including metadata (creationTime and lastSignInTime)
    fetch("https://firebase-sdk-admin.onrender.com/api/users")
      .then((response) => response.json())
      .then((data) => {
        const fetchedUsers = data.users || [];

        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set time to the beginning of today

        // Filter users based on lastSignInTime being today
        const usersSignedInToday = fetchedUsers.filter((user: { metadata: { lastSignInTime: string | number | Date; }; }) => {
          const lastSignInTime = new Date(user.metadata.lastSignInTime);
          return lastSignInTime.getTime() >= today.getTime();
        });

        setUniqueUsersCount(usersSignedInToday.length); // Update uniqueUsersCount state with count of users signed in today
      })
      .catch((error) => {
        console.error("Error fetching user data:", error);
      });
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userCollegeCount: Record<string, number> = {};

        const querySnapshot = await getDocs(collection(firestore, "users"));

        querySnapshot.forEach((doc) => {
          const userCollege = doc.data().userCollege;
          if (userCollege in userCollegeCount) {
            userCollegeCount[userCollege]++;
          } else {
            userCollegeCount[userCollege] = 1;
          }
        });

        // Mapping object for label abbreviation
        const labelMappings: Record<string, string> = {
          IHS: 'IHS',
          CAMS: 'CAMS',
          CAS: 'CAS',
          CBA: 'CBA',
          CFAD: 'CFAD',
          CITHM: 'CITHM',
          'COECSA - DCS': 'DCS',
          'COECSA - DOA': 'DOA',
          'COECSA - DOE': 'DOE',
          COL: 'COL',
          CON: 'CON',
          // Add other college abbreviations and their full names as needed...
        };

        // Modify label names before creating the data object
        const collegeNames: string[] = Object.keys(userCollegeCount).map((label) =>
          labelMappings[label] ? labelMappings[label] : label
        );

        const counts: number[] = Object.values(userCollegeCount);

        const data = {
          labels: collegeNames,
          datasets: [
            {
              label: 'Users by College',
              data: counts,
              backgroundColor: [
                '#FF6384',
                '#36A2EB',
                '#FFCE56',
                '#4BC0C0',
                '#9966FF',
                '#FF9933',
                '#6699FF',
                '#FF99CC',
                '#99FF99',
                '#FF6666',
                '#66FFCC',
              ],
            },
          ],
        };

        const ctx = pieChartRef.current?.getContext('2d');
        if (ctx) {
          if (chartInstance.current) {
            chartInstance.current.destroy();
          }


          chartInstance.current = new Chart(ctx, {
            type: 'pie',
            data: data,
            options: {
              plugins: {
                title: {
                  display: true,
                  text: 'Users by College', // Title for the pie chart
                  font: {
                    size: 18,
                  },
                },
                legend: {
                  display: false,
                  position: 'bottom',

                },
                tooltip: {
                  enabled: true, // Enable tooltips
                },
              },
            },
          });
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [firestore]);



  return (
    <div style={{
      padding: "5px",
      textAlign: "left",
      display: "flex",
      flexDirection: "row",
      flexWrap: "wrap",
      maxWidth: "100%",
      overflow: "hidden",
      justifyContent: "flex-start",
    }}>
      <div style={{ flex: "1 1 calc(33.33% - 10px)", minWidth: "240px", maxWidth: "295px", marginRight: "15px", marginBottom: "20px" }}>
        <div className="card" style={{ border: "1px solid #ccc", padding: "10px", borderRadius: "8px", cursor: "pointer", textAlign: "center", marginBottom: "0px", background: "#A62D38", color: "#FFF" }}>
          <h4 style={{ fontSize: "16px", margin: "5px 0", fontWeight: "normal" }}>Registered Users</h4>
          <p style={{ fontSize: "26px", margin: "5px 0", fontWeight: "bold" }}>{showChart ? `${periodLabel}` : ""}</p>
        </div>
        <div style={{ textAlign: "center", marginTop: "10px" }}>
          <button
            onClick={() => filterUsersByPeriod(7)}
            className={sortingPeriod === 7 ? "active-button" : "normal-button"}
            style={{ fontSize: "10px", margin: "1px" }}
          >
            Last 7 Days
          </button>
          <button
            onClick={() => filterUsersByPeriod(30)}
            className={sortingPeriod === 30 ? "active-button" : "normal-button"}
            style={{ fontSize: "10px", margin: "1px" }}
          >
            Last 30 Days
          </button>
          <button
            onClick={() => filterUsersByPeriod(365)}
            className={sortingPeriod === 365 ? "active-button" : "normal-button"}
            style={{ fontSize: "10px", margin: "1px" }}
          >
            Last 12 Months
          </button>
        </div>
        {showChart && (
          <div style={{ width: "100%", margin: "20px auto" }}>
            <canvas id="myChart" width="100%" height="300"></canvas>
          </div>
        )}
      </div>

      <div style={{ flex: "1 1 calc(33.33% - 10px)", minWidth: "240px", maxWidth: "295px", marginRight: "15px", marginBottom: "20px" }}>
        <div className="card" style={{ border: "1px solid #ccc", padding: "10px", borderRadius: "8px", cursor: "pointer", textAlign: "center", marginBottom: "0px", background: "#AB8D00", color: "#FFF" }}>
          <h4 style={{ fontSize: "16px", margin: "5px 0", fontWeight: "normal" }}>Unique Users Today</h4>
          <p style={{ fontSize: "26px", margin: "5px 0", fontWeight: "bold" }}>{uniqueUsersCount}</p>
        </div>
        <div style={{ textAlign: "center", marginTop: "10px", height: "230px" }}>
          <canvas ref={pieChartRef} id="collegeDepartmentPieChart" width="100%"></canvas>
        </div>
        <div style={{ textAlign: "center", marginTop: "20px", maxWidth: "100%" }}>
          <canvas ref={barChartRef} id="userTypeBarChart" width="100%" height="150px"></canvas>
        </div>
      </div>

      <div style={{ flex: "1 1 calc(33.33% - 10px)", minWidth: "240px", maxWidth: "295px", marginBottom: "20px" }}>
        <div style={{ width: "100%", height: "250px" }}>
          <CalendarWidget />
        </div>
        <div style={{ width: "100%", height: "150px" }}>
          <NotificationWidget />
        </div>
      </div>
    </div>
  );




};


export default DashboardView;