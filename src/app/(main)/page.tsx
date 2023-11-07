"use client";
import React, { useEffect, useState } from "react";
import { FullScreen, useFullScreenHandle } from "react-full-screen";
import Image from "next/image";
import { BiError, BiExitFullscreen, BiFullscreen, BiSolidMoon, BiSolidSun } from "react-icons/bi";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import { AiFillWarning } from "react-icons/ai";
import useTabStore, { TabStore } from "@/app/context/Tab/TabStore";
import useStore from "@/app/context/Tab/useStore";
import { Card } from "antd";
import GroupBar from "@/app/components/Chart/GroupBar";
import BarPie from "@/app/components/Chart/PieBar";
import StatBar from "@/app/components/Chart/StatBar";

export default function Dashboard() {
  const axiosAuth = useAxiosAuth()
  const [dark, setDark] = useState(true);
  const [cardInfo, setCardInfo] = useState({
    stok: '-',
    total: '-',
    keluar: '-',
    repair: '-',
    mendep: [],
    totalMendep: 0,
    isSo: false,
  })
  const [loading, setLoading] = useState(true)
  const [dataChart1, setDataChart1] = useState([])
  const [dataChart2, setDataChart2] = useState([])
  const [dataChart3, setDataChart3] = useState([])
  const handle = useFullScreenHandle();
  const tabStore : TabStore| any = useStore(useTabStore, (state) => state)

  useEffect(() => {
    fetchData()
    tabStore?.addTab({
      label: 'Dashboard',
      path: '/',
      id: 'Dashboard'
    })
    const interval = setInterval(fetchData, 5000); // Panggil fetchData setiap 3 detik
    return () => {
      clearInterval(interval); // Hentikan interval saat komponen dibongkar
    };
  }, [])


  const fetchData = async () => {
    try {
      const response = await axiosAuth.get('/dashboard',{
        cache: false
      });
      // setCardInfo({
      //   stok: response.data['data']['totalStokPallet'] ?? '-',
      //   total: response.data['data']['totalPallet'] ?? '-',
      //   keluar: response.data['data']['totalPalletKeluar'] ?? '-',
      //   repair: response.data['data']['totalPalletRepair'] ?? '-',
      //   totalMendep: response.data['data']['totalPaletMendep'] ?? 0,
      //   mendep: response.data['data']['paletMendep'] ?? [],
      //   isSo: response.data['data']['isSo'] ?? false,
      // })
      // // setHistory(response.data['data']['historyPallet'] ?? [])
      // setDataChart1(response.data.data['stokPart'] ?? [])
      setDataChart2(response.data['dayStat'] ?? [])
      setDataChart3(response.data['successRate'] ?? [])
    } catch (e: any) {
      // showErrorToast("Gagal Fetch Data");
    } finally {
      setLoading(false)
    }
  }
  return (
    <>
      <>
        <div className={`bg-white h-full flex flex-col`}>
          <FullScreen handle={handle} className={`w-full p-2 flex-grow overflow-hidden ${
            handle.active ? dark ? 'dark' : 'bg-white' : 'bg-white'}`}>
            <div className={`py-1.5 px-2 text-white flex flex-row justify-between ${
              handle.active ? dark ? 'bg-tremor-background-emphasis' : 'bg-[#2589ce]' : 'bg-[#2589ce]'}`}>
              <div className={`flex flex-row justify-between w-full mr-1 items-center`}>
                <div className={`flex items-center gap-4`}>
                  <Image src={'/images/img.png'} alt={'Logo'} width={90} height={80}/>
                  <h2 className={`font-bold text-[18px] hidden md:block`}>PT VUTEQ INDONESIA - HPM Outgoing System</h2>
                </div>
              </div>
              <div className={`flex gap-3`}>
                {
                  dark ? <div
                    onClick={() => setDark(false)}
                    className={`flex items-center`}>
                    <BiSolidSun size={20}/>
                  </div> : <div
                    onClick={() => setDark(true)}
                    className={`flex items-center`}>
                    <BiSolidMoon size={20}/>
                  </div>
                }
                {handle.active ? <div
                  onClick={handle.exit}
                  className={`flex items-center`}>
                  <BiExitFullscreen size={20}/>
                </div> : <div
                  onClick={handle.enter}
                  className={`flex items-center`}>
                  <BiFullscreen size={20}/>
                </div>}
              </div>
            </div>
            <div className={`w-full p-5`} style={{
              maxHeight: handle.active ? '100vh' : '75vh',
              overflowY: 'scroll',
              paddingBottom: handle.active ? '8vh' : '5vh'
            }}>
              {
                cardInfo.isSo && ( <div className={`w-full bg-orange-100 flex p-4 gap-4 rounded text-orange-300 border border-orange-300 mb-5`}>
                  <div className={`flex justify-center items-center text-orange-500`}>
                    <AiFillWarning size={40}/>
                  </div>
                  <div>
                    <h3 className={`text-orange-500 font-bold text-l`}>Stok Opname Aktif</h3>
                    <p>Operator Dapat Melakukan Scan SO Pada Perangkat PDA</p>
                  </div>
                </div>)
              }
              {
                cardInfo.totalMendep > 0 && ( <div className={`w-full bg-red-100 flex p-4 gap-4 rounded text-red-300 border border-red-300`}>
                  <div className={`flex justify-center items-center text-red-500`}>
                    <BiError size={40}/>
                  </div>
                  <div>
                    <h3 className={`text-red-500 font-bold text-l`}>{cardInfo.totalMendep } Pallet Belum Kembali Ke Vuteq Selama 2 Minggu, Mohon Lakukan Pengecekan</h3>
                    <p>Customer
                        {
                          cardInfo.mendep.map((r: any, index)=>(
                            <span key={index} className={`hover:cursor-pointer hover:text-red-800`}>
                              {
                                ' ' + r.customer + ' : ' + r.total + ','
                              }
                            </span>
                          ))
                        }
                    </p>
                  </div>
                </div>)
              }
              <div className={`grid-cols-1 lg:grid-cols-3 pt-2 grid gap-5 mb-5`}>
                <Card title={'Statistik Harian'} bordered={true} className={`shadow shadow-gray-400 col-span-2`}>
                  <StatBar data={dataChart2}  />
                </Card>
                <Card title={'Tingkat Keberhasilan Scan'} bordered={true} className={`shadow shadow-gray-400 col-span-1`}>
                  <BarPie data={dataChart3}  />
                </Card>
                {/*<Card title={'Statistik Scan Harian'} bordered={true} className={`shadow shadow-gray-400 col-span-3`}>*/}
                {/*  <GroupBar data={dataChart1}  />*/}
                {/*</Card>*/}
              </div>
            </div>
          </FullScreen>
        </div>
      </>
    </>
  );
}

