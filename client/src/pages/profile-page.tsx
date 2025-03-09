import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Booking, Message } from "@shared/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Edit, CreditCard, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function ProfilePage() {
  const { user, logoutMutation } = useAuth();
  
  const { data: bookings = [], isLoading: bookingsLoading } = useQuery<Booking[]>({
    queryKey: ['/api/bookings'],
    enabled: !!user,
  });
  
  const { data: messages = [], isLoading: messagesLoading } = useQuery<Message[]>({
    queryKey: ['/api/messages'],
    enabled: !!user,
  });
  
  if (!user) {
    return null; // ProtectedRoute component should handle this case
  }
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'pilgrim': return 'Pelerin';
      case 'operator': return 'Organizator';
      case 'monastery': return 'Mănăstire';
      case 'admin': return 'Administrator';
      default: return role;
    }
  };
  
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'În așteptare';
      case 'confirmed': return 'Confirmat';
      case 'cancelled': return 'Anulat';
      default: return status;
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Profile sidebar */}
          <div className="w-full md:w-1/3">
            <Card>
              <CardHeader className="text-center">
                <Avatar className="w-24 h-24 mx-auto mb-4">
                  <AvatarImage src={user.profileImage || `/images/demo/avatar-${(user.id % 3) + 1}.svg`} />
                  <AvatarFallback className="bg-primary text-white text-xl">
                    {getInitials(user.firstName, user.lastName)}
                  </AvatarFallback>
                </Avatar>
                <CardTitle>{user.firstName} {user.lastName}</CardTitle>
                <CardDescription className="flex justify-center gap-2">
                  <Badge variant="outline">{getRoleLabel(user.role)}</Badge>
                  {user.verified && (
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                      <Check className="h-3 w-3 mr-1" /> Verificat
                    </Badge>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Username:</p>
                  <p className="font-medium">{user.username}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email:</p>
                  <p className="font-medium">{user.email}</p>
                </div>
                {user.phone && (
                  <div>
                    <p className="text-sm text-gray-500">Telefon:</p>
                    <p className="font-medium">{user.phone}</p>
                  </div>
                )}
                <div className="pt-4 space-y-2">
                  <Button variant="outline" className="w-full" size="sm">
                    <Edit className="h-4 w-4 mr-2" /> Editează profilul
                  </Button>
                  <Button variant="destructive" className="w-full" size="sm" onClick={handleLogout} disabled={logoutMutation.isPending}>
                    {logoutMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Se procesează...
                      </>
                    ) : (
                      "Deconectare"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Main content */}
          <div className="w-full md:w-2/3">
            <Tabs defaultValue="bookings">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="bookings">Rezervările mele</TabsTrigger>
                <TabsTrigger value="messages">Mesaje</TabsTrigger>
              </TabsList>
              
              <TabsContent value="bookings" className="mt-6">
                <h2 className="text-xl font-bold mb-4">Rezervările mele</h2>
                
                {bookingsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : bookings.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">Nu ai nicio rezervare încă.</p>
                    <Button variant="outline" className="mt-4" asChild>
                      <a href="/pilgrimages">Descoperă pelerinaje</a>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bookings.map((booking) => (
                      <Card key={booking.id}>
                        <CardContent className="p-6">
                          <div className="flex justify-between">
                            <div>
                              <h3 className="font-bold">Pelerinaj #{booking.pilgrimageId}</h3>
                              <p className="text-sm text-gray-500">
                                Rezervare efectuată la {new Date(booking.createdAt).toLocaleDateString('ro-RO')}
                              </p>
                            </div>
                            <div>
                              <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                                {getStatusLabel(booking.status)}
                              </span>
                            </div>
                          </div>
                          
                          <div className="mt-4 space-y-2">
                            <div className="flex justify-between">
                              <span className="text-gray-500">Persoane:</span>
                              <span>{booking.persons}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Preț total:</span>
                              <span className="font-bold">{booking.totalPrice} EUR</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Status plată:</span>
                              <span className={booking.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'}>
                                {booking.paymentStatus === 'paid' ? 'Plătit' : 'În așteptare'}
                              </span>
                            </div>
                          </div>
                          
                          {booking.paymentStatus === 'pending' && (
                            <div className="mt-4">
                              <Button className="w-full" size="sm">
                                <CreditCard className="h-4 w-4 mr-2" /> Plătește acum
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="messages" className="mt-6">
                <h2 className="text-xl font-bold mb-4">Mesaje</h2>
                
                {messagesLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">Nu ai niciun mesaj.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <Card key={message.id} className={!message.read ? 'border-l-4 border-l-primary' : ''}>
                        <CardContent className="p-6">
                          <div className="flex justify-between">
                            <h3 className="font-bold">
                              {message.fromUserId === user.id ? 'Către: User #' + message.toUserId : 'De la: User #' + message.fromUserId}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {new Date(message.createdAt).toLocaleDateString('ro-RO', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </p>
                          </div>
                          <p className="mt-2">{message.content}</p>
                          
                          {message.fromUserId !== user.id && (
                            <div className="mt-4">
                              <Button variant="outline" size="sm">
                                Răspunde
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
