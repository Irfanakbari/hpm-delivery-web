"use client";
import React, { useEffect, useState } from "react";
import {BiPlusMedical, BiRefresh, BiTrash} from "react-icons/bi";
import {Alert, message, Popconfirm, Table} from "antd";
import useTabStore, {TabStore} from "@/app/context/Tab/TabStore";
import {useStore} from "zustand";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import AddModalLayout from "@/app/components/Pages/Master/Email/AddModal";
import {useForm} from "react-hook-form";

export default function History() {
  const [data, setData] = useState<any>([])
  const tabStore : TabStore| any = useStore(useTabStore, (state) => state)
  const [messageApi, contextHolder] = message.useMessage();
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [modal, setModal] = useState(false)
  const {
    register,
    handleSubmit,
    reset
  } = useForm()
  const [loading1, setLoading] = useState<boolean>(true)
  const axiosInstance = useAxiosAuth()


  useEffect(() => {
    setLoading(false)
    tabStore?.addTab({
      label: 'Master Email',
      path: '/email',
      id: 'Master Email'
    })
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await axiosInstance.get('/emails',{
        id: 'list-emails'
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

  const submitData = async (data: any) => {
    try {
      await axiosInstance.post('/emails', {
        name: data.name,
        email: data.email,
      },{
        cache: {
          update: {
            'list-emails': 'delete'
          }
        }
      });
      messageApi.open({
        type: 'success',
        content: 'Email Berhasil Ditambah',
      });
    } catch (error) {
      messageApi.open({
        type: 'error',
        content: 'Gagal Simpan Data',
      });
    } finally {
      setModal(false)
      await fetchData();
    }
  };

  const deleteData = async (e: string) => {
    setConfirmLoading(true)
    try {
      await axiosInstance.delete(`/emails/${e}`,{
        cache: {
          update: {
            'list-emails': 'delete'
          }
        }
      });
      // showSuccessToast('Data Berhasil Dihapus');
    } catch (error) {
      messageApi.open({
        type: 'error',
        content: 'Gagal Hapus Data',
      });
    } finally {
      setConfirmLoading(false);
      await fetchData();
    }
  };
  

  const columns: any = [
    {
      title: '#',
      dataIndex: 'index',
      width: 100,
      fixed: 'left',
      render: (_: any, __: any, index: any) =>  index + 1
    },
    {
      title: 'Email',
      dataIndex: 'email',
      sorter: (a: any, b: any) => a.email.localeCompare(b.email),
    },
    {
      title: 'Nama',
      dataIndex: 'name',
      sorter: (a: any, b: any) => a.name.localeCompare(b.name),
    },
    {
      title: 'Aksi',
      width: '10%',
      dataIndex: 'operation',
      render: (_: any, record: any) => {
        return (
            <span>
                    <span className="flex">
                        <Popconfirm
                            title="Apakah Anda yakin ingin menghapus?"
                            onConfirm={() => deleteData(record.id)}
                            okText="Yes"
                            okType={'danger'}
                            okButtonProps={{loading: confirmLoading}}
                        >
                            <button>
                                <BiTrash size={22} color="red"/>
                            </button>
                        </Popconfirm>
                    </span>

            </span>
        );
      }
    }
  ];


  return (
      <>
        {contextHolder}
        <div className={`bg-white h-full flex flex-col`}>
          {modal && (
              <AddModalLayout close={() => setModal(false)} onSubmit={handleSubmit(submitData)} reset={reset}
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
            <Alert
                className={`mb-1`}
                type="info"
                message="Email digunakan untuk notifikasi laporan harian yang secara otomatis dikirim setiap malam"
                banner
                closable
            />
            <Table
                loading={loading1}
                bordered
                scroll={{
                  y: "65vh"
                }}
                rowKey={'id'} columns={columns} dataSource={data} size={'small'}
                rowClassName="editable-row"
            />
          </div>
        </div>
      </>
  );
}
