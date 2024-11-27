'use client'

import React,{ useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, Loader2, Search } from 'lucide-react'
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import useSWR from 'swr'

interface DataItem {
  pk: number;
  image: string;
}

interface PaginatedResponse {
  data: DataItem[];
  total: number;
  page: number;
  pageSize: number;
}

const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to fetch data');
  }
  return response.json();
}

export default function Home() {
  const [pk, setPk] = useState('')
  const [imagePath, setImagePath] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [isStoringMySQL, setIsStoringMySQL] = useState(false)
  const [isPushingToSQLServer, setIsPushingToSQLServer] = useState(false)
  const [mysqlPage, setMysqlPage] = useState(1)
  const [sqlServerPage, setSqlServerPage] = useState(1)
  const pageSize = 50
  const [mysqlSearch, setMysqlSearch] = useState('')
  const [sqlServerSearch, setSqlServerSearch] = useState('')

  const { data: mysqlData, error: mysqlError, mutate: mutateMysql } = useSWR<PaginatedResponse>(
    `/api/retrieve-mysql?page=${mysqlPage}&pageSize=${pageSize}&search=${encodeURIComponent(mysqlSearch)}`,
    fetcher
  )

  const { data: sqlServerData, error: sqlServerError, mutate: mutateSqlServer } = useSWR<PaginatedResponse>(
    `/api/retrieve-sqlserver?page=${sqlServerPage}&pageSize=${pageSize}&search=${encodeURIComponent(sqlServerSearch)}`,
    fetcher
  )

  const handleStore = async () => {
    setMessage('');
    setError('');
    setIsStoringMySQL(true);
    try {
      const response = await fetch('/api/store-mysql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pk: parseInt(pk), imagePath })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to store data');
      }
      setMessage(data.message);
      mutateMysql();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
      console.error('Error storing data:', error);
    } finally {
      setIsStoringMySQL(false);
    }
  }

  const handleRetrieveAndPush = async () => {
    setMessage('');
    setError('');
    setIsPushingToSQLServer(true);
    try {
      const retrieveResponse = await fetch('/api/retrieve-mysql')
      if (!retrieveResponse.ok) {
        const errorData = await retrieveResponse.json();
        throw new Error(errorData.error || 'Failed to retrieve data');
      }
      const retrievedData = await retrieveResponse.json()
      
      const pushResponse = await fetch('/api/push-sqlserver', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(retrievedData.data)
      })
      if (!pushResponse.ok) {
        const errorData = await pushResponse.json();
        throw new Error(errorData.error || 'Failed to push data');
      }
      const pushData = await pushResponse.json()
      setMessage(pushData.message);
      mutateMysql();
      mutateSqlServer();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
      console.error('Error in retrieve and push operation:', error);
    } finally {
      setIsPushingToSQLServer(false);
    }
  }

  const renderPagination = useCallback((currentPage: number, totalItems: number, onPageChange: (page: number) => void) => {
    const totalPages = Math.ceil(totalItems / pageSize);
    return (
      <div className="flex justify-center space-x-2 mt-4">
        <Button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>Previous</Button>
        <span className="self-center">{`Page ${currentPage} of ${totalPages}`}</span>
        <Button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>Next</Button>
      </div>
    );
  }, [pageSize]);

  const handleSearch = (database: 'mysql' | 'sqlserver', value: string) => {
    if (database === 'mysql') {
      setMysqlSearch(value);
      setMysqlPage(1);
    } else {
      setSqlServerSearch(value);
      setSqlServerPage(1);
    }
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Database Transfer App</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Input
              type="number"
              placeholder="Primary Key"
              value={pk}
              onChange={(e) => setPk(e.target.value)}
              aria-label="Primary Key"
            />
            <Textarea
              placeholder="Image Path"
              value={imagePath}
              onChange={(e) => setImagePath(e.target.value)}
              aria-label="Image Path"
              rows={3}
            />
            <Button onClick={handleStore} className="w-full" disabled={isStoringMySQL}>
              {isStoringMySQL ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Storing in MySQL...
                </>
              ) : (
                'Store in MySQL'
              )}
            </Button>
          </div>
          <Button onClick={handleRetrieveAndPush} className="w-full" disabled={isPushingToSQLServer}>
            {isPushingToSQLServer ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Retrieving and Pushing...
              </>
            ) : (
              'Retrieve from MySQL and Push to SQL Server'
            )}
          </Button>
          {message && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Tabs defaultValue="mysql" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="mysql">MySQL Data</TabsTrigger>
              <TabsTrigger value="sqlserver">SQL Server Data</TabsTrigger>
            </TabsList>
            <TabsContent value="mysql">
              <Card>
                <CardHeader>
                  <CardTitle>MySQL Data</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Input
                      placeholder="Search..."
                      value={mysqlSearch}
                      onChange={(e) => handleSearch('mysql', e.target.value)}
                    />
                    <Button onClick={() => mutateMysql()}>
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {mysqlError ? (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>Failed to load MySQL data</AlertDescription>
                    </Alert>
                  ) : !mysqlData ? (
                    <div className="flex justify-center items-center h-32">
                      <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                  ) : (
                    <>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>PK</TableHead>
                            <TableHead>Image Path</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {mysqlData.data.map((item) => (
                            <TableRow key={item.pk}>
                              <TableCell>{item.pk}</TableCell>
                              <TableCell>{item.image}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      {renderPagination(mysqlData.page, mysqlData.total, setMysqlPage)}
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="sqlserver">
              <Card>
                <CardHeader>
                  <CardTitle>SQL Server Data</CardTitle>
                </CardHeader>
                <CardContent>
                  {sqlServerError ? (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>Failed to load SQL Server data</AlertDescription>
                    </Alert>
                  ) : !sqlServerData ? (
                    <div className="flex justify-center items-center h-32">
                      <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                  ) : (
                    <>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>PK</TableHead>
                            <TableHead>Image Path</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {sqlServerData.data.map((item) => (
                            <TableRow key={item.pk}>
                              <TableCell>{item.pk}</TableCell>
                              <TableCell>{item.image}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      {renderPagination(sqlServerData.page, sqlServerData.total, setSqlServerPage)}
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

