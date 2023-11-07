"use client";
import React, { useEffect, useState } from "react";
import { BiPlusMedical, BiRefresh } from "react-icons/bi";
import {message, Table} from "antd";
import { useForm } from "react-hook-form";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import useTabStore, { TabStore } from "@/app/context/Tab/TabStore";
import useStore from "@/app/context/Tab/useStore";
import AddModalLayout from "@/app/components/Pages/Master/Orders/AddModal";
import {useSession} from "next-auth/react";
import dayjs from "dayjs";

export default function Order() {
  const [data, setData] = useState<any>([])
  const [modal, setModal] = useState(false)
  const tabStore : TabStore| any = useStore(useTabStore, (state) => state)
  const [messageApi, contextHolder] = message.useMessage();

  const [loading1, setLoading] = useState<boolean>(true)
  const {
    register,
    handleSubmit,
    reset
  } = useForm()
  const axiosInstance = useAxiosAuth()


  useEffect(() => {
    setLoading(false)
    tabStore?.addTab({
      label: 'Master Order',
      path: '/order',
      id: 'Master Order'
    })
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await axiosInstance.get('/orders',{
        cache: false
      });
      setData(response.data)
    } catch (error) {
      messageApi.open({
        type: 'error',
        content: 'Gagal Mengambil Data',
      });
    } finally {
      setLoading(false)
    }
  };

  const onChange = (pagination: any) => {
    setLoading(true);

    const url = `/orders?page=${pagination.current}&limit=${pagination.pageSize}`;
    axiosInstance.get(url,{
      cache: false
    })
        .then(response => {
          setData(response.data);
        })
        .catch(() => {
          messageApi.open({
            type: 'error',
            content: 'Gagal Mengambil Data',
          });
        })
        .finally(() => {
          setLoading(false);
        });

  };

  const submitImport = (data: any) => {
    const formData = new FormData();
    formData.append("file", data.file[0]); // "excel_file" harus sesuai dengan nama field pada backend yang menerima file Excel
    axiosInstance
        .post('/orders', formData,{
          headers: {
            'Content-Type': 'multipart/form-data', // Pastikan header Content-Type diatur ke 'multipart/form-data'
          }
        })
        .then(() => {
          messageApi.open({
            type: 'success',
            content: 'Import Sukses',
          });
          fetchData();
        })
        .catch((e) => {
          messageApi.open({
            type: 'error',
            content: 'Gagal Import Data',
          });
        })
        .finally(() => {
          setModal(false);
          reset();
        });
  };

  const deleteData = async (e: string) => {
    try {
      await axiosInstance.delete(`/orders/${e}`,);
      messageApi.open({
        type: 'success',
        content: 'Data Berhasil Dihapus',
      });
    } catch (error) {
      messageApi.open({
        type: 'error',
        content: 'Data Gagal Dihapus',
      });
    } finally {
      await fetchData();
    }
  };


  const columns: any = [
    {
      title: '#',
      dataIndex: 'index',
      width: 90,
      fixed: 'left',
      render: (_: any, __: any, index: any) => (data.currentPage - 1) * data.limit + index + 1
    },
    {
      title: 'Kode PCC',
      dataIndex: 'kode',
      fixed: 'left',
      width: 250,
      onFilter: (value: any, record: any) =>
          record['kode'].toString().toLowerCase().includes(value.toLowerCase()),
      sorter: (a:any, b:any) => a.kode.localeCompare(b.kode),
    },
    {
      title: 'Part No',
      dataIndex: 'part_no',
      fixed: 'left',
      width: 200,
      onFilter: (value: any, record: any) =>
          record['part_no'].toString().toLowerCase().includes(value.toLowerCase()),
      sorter: (a:any, b:any) => a.part_no.localeCompare(b.part_no),
    },
    {
      title: 'Part Name',
      dataIndex: 'part_name',
      width: 280,
      fixed: 'left',
      onFilter: (value: any, record: any) =>
          record['part_name'].toString().toLowerCase().includes(value.toLowerCase()),
      sorter: (a:any, b:any) => a.part_name.localeCompare(b.part_name),
    },
    {
      title: 'Part Color',
      dataIndex: 'part_color',
      width: 200,
      onFilter: (value: any, record: any) =>
          record['part_color'].toString().toLowerCase().includes(value.toLowerCase()),
      sorter: (a:any, b:any) => a.part_color.localeCompare(b.part_color),
    },
    {
      title: 'Qty',
      dataIndex: 'qty',
      width: 100,
      onFilter: (value: any, record: any) =>
          record['qty'].toString().toLowerCase().includes(value.toLowerCase()),
      sorter: (a:any, b:any) => a.qty.localeCompare(b.qty),
    },
    {
      title: 'To 1',
      dataIndex: 'to1',
      width: 100,
      onFilter: (value: any, record: any) =>
          record['to1'].toString().toLowerCase().includes(value.toLowerCase()),
      sorter: (a:any, b:any) => a.to1.localeCompare(b.to1),
    },

    {
      title: 'To 2',
      dataIndex: 'to2',
      width: 100,
      onFilter: (value: any, record: any) =>
          record['to2'].toString().toLowerCase().includes(value.toLowerCase()),
      sorter: (a:any, b:any) => a.to2.localeCompare(b.to2),
    },
    {
      title: 'Date Local',
      dataIndex: 'date_local',
      width: 140,
      onFilter: (value: any, record: any) =>
          record['date_local'].toString().toLowerCase().includes(value.toLowerCase()),
      sorter: (a:any, b:any) => a.date_local.localeCompare(b.date_local),
    },
    {
      title: 'Time Local',
      dataIndex: 'time_local',
      width: 140,
      onFilter: (value: any, record: any) =>
          record['time_local'].toString().toLowerCase().includes(value.toLowerCase()),
      sorter: (a:any, b:any) => a.time_local.localeCompare(b.time_local),
    },
    {
      title: 'Date Export',
      dataIndex: 'date_export',
      width: 140,
      onFilter: (value: any, record: any) =>
          record['date_export'].toString().toLowerCase().includes(value.toLowerCase()),
      sorter: (a:any, b:any) => a.date_export.localeCompare(b.date_export),
    },
    {
      title: 'Time Export',
      dataIndex: 'time_export',
      width: 140,
      onFilter: (value: any, record: any) =>
          record['time_export'].toString().toLowerCase().includes(value.toLowerCase()),
      sorter: (a:any, b:any) => a.time_export.localeCompare(b.time_export),
    },
    {
      title: 'Weekly',
      dataIndex: 'weekly',
      width: 150,
      onFilter: (value: any, record: any) =>
          record['weekly'].toString().toLowerCase().includes(value.toLowerCase()),
      sorter: (a:any, b:any) => a.weekly.localeCompare(b.weekly),
    },
    {
      title: 'Tipe Part',
      dataIndex: 'type_part',
      width: 100,
      onFilter: (value: any, record: any) =>
          record['type_part'].toString().toLowerCase().includes(value.toLowerCase()),
      sorter: (a:any, b:any) => a.type_part.localeCompare(b.type_part),
    },
    {
      title: 'KD Lot No',
      dataIndex: 'kd_lot_no',
      width: 250,
      onFilter: (value: any, record: any) =>
          record['kd_lot_no'].toString().toLowerCase().includes(value.toLowerCase()),
      sorter: (a:any, b:any) => a.kd_lot_no.localeCompare(b.kd_lot_no),
    },
    {
      title: 'Production SEQ No',
      dataIndex: 'seq_no',
      width: 250,
      onFilter: (value: any, record: any) =>
          record['seq_no'].toString().toLowerCase().includes(value.toLowerCase()),
      sorter: (a:any, b:any) => a.seq_no.localeCompare(b.seq_no),
    },
    {
      title: 'Date',
      dataIndex: 'date',
      width: 100,
      onFilter: (value: any, record: any) =>
          record['date'].toString().toLowerCase().includes(value.toLowerCase()),
      sorter: (a:any, b:any) => a.date.localeCompare(b.date),
    },
    {
      title: 'Time',
      dataIndex: 'time',
      width: 100,
      render: (_:any, record:any) => record['time'] ? dayjs(record['time']).format('HH:mm') : '-',  // Check if time is null
      onFilter: (value: any, record: any) =>
          record['time'] ? record['time'].toString().toLowerCase().includes(value.toLowerCase()) : false,
      sorter: (a: any, b: any) => a.time && b.time ? dayjs(a.time).diff(dayjs(b.time)) : 0,
    },

  ];


  return (
    <>
      {contextHolder}
      <div className={`bg-white h-full flex flex-col`}>
        {modal && (
          <AddModalLayout close={() => setModal(false)} onSubmit={handleSubmit(submitImport)} reset={reset}
                          register={register}/>)}

        <div className="w-full bg-base py-0.5 px-1 text-white flex flex-row">
          <div
            onClick={() => setModal(true)}
            className="flex-row flex items-center gap-1 px-3 py-1 hover:bg-[#2589ce] hover:cursor-pointer"
          >
            <BiPlusMedical size={12}/>
            <p className="text-white font-bold text-sm">Baru</p>
          </div>

          <div
            onClick={fetchData}
            className="flex-row flex items-center gap-1 px-3 py-1 hover:bg-[#2589ce] hover:cursor-pointer"
          >
            <BiRefresh size={12}/>
            <p className="text-white font-bold text-sm">Refresh</p>
          </div>
        </div>
        <div className="w-full bg-white p-2 flex-grow overflow-hidden">
            <Table
              loading={loading1}
              bordered
              scroll={{
                y: "65vh"
              }}
              onChange={onChange}
              rowKey={'kode'} columns={columns} dataSource={data.data} size={'small'}
              rowClassName="editable-row"
              pagination={{
                total: data['totalData'],
                defaultPageSize: 100,
                hideOnSinglePage: true,
                pageSizeOptions: [100, 300, 500, 1000, 2000],
                showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`
              }}
            />
        </div>
      </div>
    </>
  );
}
