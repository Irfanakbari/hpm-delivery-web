"use client";
import React, { useEffect, useState } from "react";
import { BiRefresh } from "react-icons/bi";
import {Button, DatePicker, message, Space, Table} from "antd";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import useTabStore, { TabStore } from "@/app/context/Tab/TabStore";
import useStore from "@/app/context/Tab/useStore";
import dayjs from "dayjs";
import {CalendarOutlined} from "@ant-design/icons";
import ExcelJS from "exceljs"
import {AiFillFileExcel} from "react-icons/ai";

export default function History() {
  const [data, setData] = useState<any>([])
  const tabStore : TabStore| any = useStore(useTabStore, (state) => state)
  const [messageApi, contextHolder] = message.useMessage();
  const {RangePicker} = DatePicker;

  const [loading1, setLoading] = useState<boolean>(true)
  const axiosInstance = useAxiosAuth()


  useEffect(() => {
    setLoading(false)
    tabStore?.addTab({
      label: 'Riwayat Scan',
      path: '/riwayat',
      id: 'Riwayat Scan'
    })
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await axiosInstance.get('/histories',{
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

  const onChange = (pagination: any, filters:any) => {
    setLoading(true)
    const keluarStart = (filters?.timestamp && filters?.timestamp[0][0]) || '';
    const keluarEnd = (filters?.timestamp && filters?.timestamp[0][1]) || '';

    const parsedKeluarStart = dayjs(keluarStart);
    const parsedKeluarEnd = dayjs(keluarEnd);

    const formattedKeluarStart = parsedKeluarStart.isValid() ? parsedKeluarStart.format('YYYY-MM-DD') : '';
    const formattedKeluarEnd = parsedKeluarEnd.isValid() ? parsedKeluarEnd.format('YYYY-MM-DD') : '';

    const url = `/histories?start=${formattedKeluarStart}&end=${formattedKeluarEnd}&page=${pagination.current}&limit=${pagination.pageSize}`;
    axiosInstance.get(url)
        .then(response => {
          setData(response.data);
        })
        .catch(() => {
          messageApi.open({
            type: 'error',
            content: 'Gagal Mengambil Data',
          });        })
        .finally(() => {
          setLoading(false);
        });
  };


  const columns: any = [
    {
      title: '#',
      dataIndex: 'index',
      width: 100,
      fixed: 'left',
      render: (_: any, __: any, index: any) => (data.currentPage - 1) * data.limit + index + 1
    },
    {
      title: 'Kode PCC',
      dataIndex: 'barcode_pcc',
      onFilter: (value: any, record: any) =>
          record['barcode_pcc'].toString().toLowerCase().includes(value.toLowerCase()),
      sorter: (a: any, b: any) => a.barcode_pcc.localeCompare(b.barcode_pcc),
    },
    {
      title: 'Kode Part',
      dataIndex: 'id_part',
      onFilter: (value: any, record: any) =>
          record['id_part'].toString().toLowerCase().includes(value.toLowerCase()),
      sorter: (a: any, b: any) => a.id_part.localeCompare(b.id_part),
    },
    {
      title: 'TimeStamp',
      dataIndex: 'timestamp',
      sorter: (a: any, b: any) => {
        // Convert the 'keluar' values to Date objects for comparison
        const dateA = a['timestamp'] ? new Date(a['timestamp']) : null;
        const dateB = b['timestamp'] ? new Date(b['timestamp']) : null;
        // Handle cases when one of the dates is null
        if (!dateA && dateB) return -1;
        if (dateA && !dateB) return 1;
        if (!dateA && !dateB) return 0;
        // Compare the dates
        return dateA!.getTime() - dateB!.getTime();
      },
      filterDropdown: ({setSelectedKeys, selectedKeys, confirm, clearFilters, close}: any) => (
          <div
              style={{
                padding: 8,
              }}
              onKeyDown={(e) => e.stopPropagation()}
          >
            <RangePicker
                style={{
                  marginBottom: 8,
                  width: "100%",
                }}
                value={selectedKeys[0]}
                onChange={newDateRange => {
                  setSelectedKeys(newDateRange ? [newDateRange] : [])
                }}
            />
            <Space>
              <Button
                  type="primary"
                  size="small"
                  style={{
                    width: 90,
                  }}
                  onClick={() => {
                    confirm({
                      closeDropdown: true,
                    });
                  }}
              >
                Filter
              </Button>
              <Button
                  onClick={() => clearFilters}
                  size="small"
                  style={{
                    width: 90,
                  }}
              >
                Reset
              </Button>
              <Button
                  type="link"
                  size="small"
                  onClick={() => {
                    close();
                  }}
              >
                close
              </Button>
            </Space>
          </div>
      ),
      filterIcon: (filtered: any) => (
          <CalendarOutlined
              style={{
                color: filtered ? '#1890ff' : undefined,
              }}
          />
      ),
      render: (_:any, record: any) => {
        return record['timestamp']
            ? dayjs(record['timestamp']).format('DD MMMM YYYY HH:mm')
            : '-'
      }
    },
    {
      title: 'Operator',
      dataIndex: 'operator',
      onFilter: (value: any, record: any) =>
          record['operator'].toString().toLowerCase().includes(value.toLowerCase()),
      sorter: (a: any, b: any) => a.operator.localeCompare(b.operator),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      onFilter: (value: any, record: any) =>
          record['status'].toString().toLowerCase().includes(value.toLowerCase()),
      sorter: (a: any, b: any) => a.status.localeCompare(b.status),
    },
  ];

  const getData = async () => {
    try {
      const response = await axiosInstance.get(`/histories`);
      return response.data;
    } catch (error) {
      messageApi.open({
        type: 'error',
        content: 'Gagal Export Data',
      });
      throw error; // Mengembalikan error agar dapat ditangani di tempat lain jika perlu
    } finally {
      setLoading(false);
    }
  };


  const saveExcel = async (e: any) => {
    e.preventDefault();
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("My Sheet");
    // sheet.properties.defaultRowHeight = 25;
    sheet.getCell('A1:I1').fill = {
      type: 'pattern',
      pattern:'solid',
      fgColor : {argb: '0366fc'}
    }
    sheet.getCell('B1').fill = {
      type: 'pattern',
      pattern:'solid',
      fgColor : {argb: '0366fc'}
    }
    sheet.getCell('C1').fill = {
      type: 'pattern',
      pattern:'solid',
      fgColor : {argb: '0366fc'}
    }
    sheet.getCell('D1').fill = {
      type: 'pattern',
      pattern:'solid',
      fgColor : {argb: '0366fc'}
    }
    sheet.getCell('E1').fill = {
      type: 'pattern',
      pattern:'solid',
      fgColor : {argb: '0366fc'}
    }
    sheet.getCell('F1').fill = {
      type: 'pattern',
      pattern:'solid',
      fgColor : {argb: '0366fc'}
    }
    sheet.getRow(1).font = {
      family: 4,
      size: 14,
      bold: true,
      color: {argb: 'FFFFFF'}
    }
    sheet.columns = [
      {
        header: "No",
        key: "no",
        width: 10,
      },
      {
        header: "Kode PCC",
        key: "barcode_pcc",
        width: 32,
      },
      {
        header: "Kode Part",
        key: "id_part",
        width: 32,
      },
      {
        header: "Time Stamp",
        key: "timestamp",
        width: 32,
      },
      {
        header: "Operator",
        key: "operator",
        width: 32,
      },
      {
        header: "Status",
        key: "status",
        width: 32,
      },
    ];
    const data = await getData()
    data.data.map((item: any, index: any) => {
      sheet.addRow({
        no: index + 1,
        barcode_pcc: item.barcode_pcc,
        id_part: item.id_part,
        operator: item.operator,
        timestamp: item.timestamp ? dayjs(item.timestamp).locale('id').format('DD MMMM YYYY HH:mm') : '-',
        status: item.status
      });
    });
    await workbook.xlsx.writeBuffer().then(data=>{
      const blob = new Blob([data], {type: 'application/vnd.openxmlformats-officedocument.spreadsheet.sheet'})
      const url = window.URL.createObjectURL(blob)
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'Lap. Riwayat HPM.xlsx';
      anchor.click();
      window.URL.revokeObjectURL(anchor.toString());
    })
  };


  return (
      <>
        {contextHolder}
        <div className={`bg-white h-full flex flex-col`}>
          <div className="w-full bg-base py-0.5 px-1 text-white flex flex-row">
            <div
                onClick={fetchData}
                className="flex-row flex items-center gap-1 px-3 py-1 hover:bg-[#2589ce] hover:cursor-pointer"
            >
              <BiRefresh size={12}/>
              <p className="text-white font-bold text-sm">Refresh</p>
            </div>
            <div onClick={saveExcel} className="flex-row flex items-center gap-1 px-3 py-1 hover:bg-[#2589ce] hover:cursor-pointer">
              <AiFillFileExcel size={12} />
              <p className="text-white font-bold text-sm">Excel</p>
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
                rowKey={'id'} columns={columns} dataSource={data.data} size={'small'}
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
