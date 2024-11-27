'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface DataItem {
  pk: number;
  image: string;
}

export default function Home() {
  const [pk, setPk] = useState('')
  const [imagePath, setImagePath] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [mysqlData, setMysqlData] = useState<DataItem[]>([])
  const [sqlServerData, setSqlServerData] = useState<DataItem[]>([])
  const [isStoringMySQL, setIsStoringMySQL] = useState(false)
  const [isPushingToSQLServer, setIsPushingToSQLServer] = useState(false)

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
      fetchData();
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
        body: JSON.stringify(retrievedData)
      })
      if (!pushResponse.ok) {
        const errorData = await pushResponse.json();
        throw new Error(errorData.error || 'Failed to push data');
      }
      const pushData = await pushResponse.json()
      setMessage(pushData.message);
      fetchData();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
      console.error('Error in retrieve and push operation:', error);
    } finally {
      setIsPushingToSQLServer(false);
    }
  }

  const fetchData = async () => {
    try {
      const mysqlResponse = await fetch('/api/retrieve-mysql');
      const mysqlData = await mysqlResponse.json();
      setMysqlData(mysqlData);

      const sqlServerResponse = await fetch('/api/retrieve-sqlserver');
      const sqlServerData = await sqlServerResponse.json();
      setSqlServerData(sqlServerData);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to fetch data from databases');
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

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
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>PK</TableHead>
                        <TableHead>Image Path</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mysqlData.map((item) => (
                        <TableRow key={item.pk}>
                          <TableCell>{item.pk}</TableCell>
                          <TableCell>{item.image}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="sqlserver">
              <Card>
                <CardHeader>
                  <CardTitle>SQL Server Data</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>PK</TableHead>
                        <TableHead>Image Path</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sqlServerData.map((item) => (
                        <TableRow key={item.pk}>
                          <TableCell>{item.pk}</TableCell>
                          <TableCell>{item.image}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

