import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Redirect } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ShieldIcon, ShieldCheckIcon, ShieldXIcon, UserCheckIcon, UserXIcon, FilterIcon } from "lucide-react";
import { User } from "@shared/schema";

export default function UsersPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState("");
  const [userDetailsOpen, setUserDetailsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Query pentru a obține toți utilizatorii
  const {
    data: users,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["/api/admin/users"],
    queryFn: () => apiRequest("GET", "/api/admin/users").then((res) => res.json()),
  });

  // Mutație pentru a verifica un utilizator
  const verifyUserMutation = useMutation({
    mutationFn: (userId: number) =>
      apiRequest("PUT", `/api/users/${userId}/verify`, {}),
    onSuccess: () => {
      toast({
        title: "Utilizator verificat",
        description: "Utilizatorul a fost verificat cu succes.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: (error: any) => {
      toast({
        title: "Eroare",
        description: `Nu s-a putut verifica utilizatorul: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Mutație pentru a actualiza rolul unui utilizator
  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: number; role: string }) =>
      apiRequest("PUT", `/api/users/${userId}/role`, { role }),
    onSuccess: () => {
      toast({
        title: "Rol actualizat",
        description: "Rolul utilizatorului a fost actualizat cu succes.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: (error: any) => {
      toast({
        title: "Eroare",
        description: `Nu s-a putut actualiza rolul utilizatorului: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleVerifyUser = (userId: number) => {
    verifyUserMutation.mutate(userId);
  };

  const handleUpdateRole = (userId: number, role: string) => {
    updateRoleMutation.mutate({ userId, role });
  };

  const handleShowUserDetails = (user: User) => {
    setSelectedUser(user);
    setUserDetailsOpen(true);
  };

  const filteredUsers = filter
    ? users?.filter(
        (user: User) =>
          user.username.toLowerCase().includes(filter.toLowerCase()) ||
          user.email.toLowerCase().includes(filter.toLowerCase()) ||
          user.firstName.toLowerCase().includes(filter.toLowerCase()) ||
          user.lastName.toLowerCase().includes(filter.toLowerCase()) ||
          user.role.toLowerCase().includes(filter.toLowerCase())
      )
    : users;

  // Verificare dacă utilizatorul este admin
  if (!user || user.role !== "admin") {
    return <Redirect to="/" />;
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return (
          <Badge variant="destructive" className="ml-2">
            <ShieldIcon className="h-3 w-3 mr-1" />
            Admin
          </Badge>
        );
      case "operator":
        return (
          <Badge variant="default" className="ml-2">
            <ShieldCheckIcon className="h-3 w-3 mr-1" />
            Operator
          </Badge>
        );
      case "monastery":
        return (
          <Badge variant="secondary" className="ml-2">
            <ShieldCheckIcon className="h-3 w-3 mr-1" />
            Mănăstire
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="ml-2">
            Pelerin
          </Badge>
        );
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold">Gestionare Utilizatori</h1>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Input
            placeholder="Caută utilizatori..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="max-w-sm"
          />
          <Button variant="outline" onClick={() => setFilter("")} size="icon">
            <FilterIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all">
        <TabsList className="mb-4">
          <TabsTrigger value="all">Toți utilizatorii</TabsTrigger>
          <TabsTrigger value="unverified">Neverificați</TabsTrigger>
          <TabsTrigger value="organizers">Organizatori</TabsTrigger>
          <TabsTrigger value="pilgrims">Pelerini</TabsTrigger>
        </TabsList>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : isError ? (
          <div className="text-center py-8 text-destructive">
            Eroare la încărcarea datelor. Vă rugăm să încercați din nou mai
            târziu.
          </div>
        ) : (
          <>
            <TabsContent value="all">
              <Card>
                <CardHeader>
                  <CardTitle>Toți utilizatorii</CardTitle>
                  <CardDescription>
                    Gestionați toți utilizatorii platformei
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <UserTable
                    users={filteredUsers}
                    handleVerifyUser={handleVerifyUser}
                    handleUpdateRole={handleUpdateRole}
                    handleShowUserDetails={handleShowUserDetails}
                    getRoleBadge={getRoleBadge}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="unverified">
              <Card>
                <CardHeader>
                  <CardTitle>Utilizatori neverificați</CardTitle>
                  <CardDescription>
                    Utilizatori care necesită verificare
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <UserTable
                    users={filteredUsers?.filter((user: User) => !user.verified)}
                    handleVerifyUser={handleVerifyUser}
                    handleUpdateRole={handleUpdateRole}
                    handleShowUserDetails={handleShowUserDetails}
                    getRoleBadge={getRoleBadge}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="organizers">
              <Card>
                <CardHeader>
                  <CardTitle>Organizatori</CardTitle>
                  <CardDescription>
                    Utilizatorii cu rol de operator sau mănăstire
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <UserTable
                    users={filteredUsers?.filter(
                      (user: User) =>
                        user.role === "operator" || user.role === "monastery"
                    )}
                    handleVerifyUser={handleVerifyUser}
                    handleUpdateRole={handleUpdateRole}
                    handleShowUserDetails={handleShowUserDetails}
                    getRoleBadge={getRoleBadge}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="pilgrims">
              <Card>
                <CardHeader>
                  <CardTitle>Pelerini</CardTitle>
                  <CardDescription>
                    Utilizatorii cu rol de pelerin
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <UserTable
                    users={filteredUsers?.filter(
                      (user: User) => user.role === "pilgrim"
                    )}
                    handleVerifyUser={handleVerifyUser}
                    handleUpdateRole={handleUpdateRole}
                    handleShowUserDetails={handleShowUserDetails}
                    getRoleBadge={getRoleBadge}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </>
        )}
      </Tabs>

      {selectedUser && (
        <Dialog open={userDetailsOpen} onOpenChange={setUserDetailsOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Detalii utilizator</DialogTitle>
              <DialogDescription>
                Informații complete despre utilizator
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage
                    src={selectedUser.profileImage}
                    alt={selectedUser.username}
                  />
                  <AvatarFallback className="text-lg">
                    {selectedUser.firstName[0]}
                    {selectedUser.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold flex items-center">
                    {selectedUser.firstName} {selectedUser.lastName}
                    {getRoleBadge(selectedUser.role)}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    @{selectedUser.username}
                  </p>
                  <div className="flex items-center mt-1">
                    {selectedUser.verified ? (
                      <Badge variant="outline" className="bg-green-50">
                        <UserCheckIcon className="h-3 w-3 mr-1 text-green-500" />
                        Verificat
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-amber-50">
                        <UserXIcon className="h-3 w-3 mr-1 text-amber-500" />
                        Neverificat
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">
                    Email
                  </h4>
                  <p>{selectedUser.email}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">
                    Telefon
                  </h4>
                  <p>{selectedUser.phone || "Nedisponibil"}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">
                    Data înregistrării
                  </h4>
                  <p>
                    {new Date(selectedUser.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">
                    Rol
                  </h4>
                  <p className="capitalize">{selectedUser.role}</p>
                </div>
              </div>

              {selectedUser.bio && (
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">
                    Biografie
                  </h4>
                  <p>{selectedUser.bio}</p>
                </div>
              )}
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2">
              {!selectedUser.verified && (
                <Button
                  onClick={() => handleVerifyUser(selectedUser.id)}
                  disabled={verifyUserMutation.isPending}
                >
                  <UserCheckIcon className="h-4 w-4 mr-2" />
                  Verifică utilizatorul
                </Button>
              )}
              <div className="flex gap-2">
                {selectedUser.role !== "operator" && (
                  <Button
                    variant="outline"
                    onClick={() =>
                      handleUpdateRole(selectedUser.id, "operator")
                    }
                    disabled={updateRoleMutation.isPending}
                  >
                    Setează ca Operator
                  </Button>
                )}
                {selectedUser.role !== "monastery" && (
                  <Button
                    variant="outline"
                    onClick={() =>
                      handleUpdateRole(selectedUser.id, "monastery")
                    }
                    disabled={updateRoleMutation.isPending}
                  >
                    Setează ca Mănăstire
                  </Button>
                )}
                {selectedUser.role !== "pilgrim" && (
                  <Button
                    variant="outline"
                    onClick={() => handleUpdateRole(selectedUser.id, "pilgrim")}
                    disabled={updateRoleMutation.isPending}
                  >
                    Setează ca Pelerin
                  </Button>
                )}
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// Componenta tabel utilizatori
function UserTable({
  users,
  handleVerifyUser,
  handleUpdateRole,
  handleShowUserDetails,
  getRoleBadge,
}: {
  users: User[];
  handleVerifyUser: (userId: number) => void;
  handleUpdateRole: (userId: number, role: string) => void;
  handleShowUserDetails: (user: User) => void;
  getRoleBadge: (role: string) => React.ReactNode;
}) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Utilizator</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Acțiuni</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users && users.length > 0 ? (
            users.map((user: User) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={user.profileImage} alt={user.username} />
                      <AvatarFallback>
                        {user.firstName[0]}
                        {user.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium flex items-center">
                        {user.firstName} {user.lastName}
                        {getRoleBadge(user.role)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        @{user.username}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  {user.verified ? (
                    <Badge variant="outline" className="bg-green-50">
                      <UserCheckIcon className="h-3 w-3 mr-1 text-green-500" />
                      Verificat
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-amber-50">
                      <UserXIcon className="h-3 w-3 mr-1 text-amber-500" />
                      Neverificat
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleShowUserDetails(user)}
                    >
                      Detalii
                    </Button>
                    {!user.verified && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleVerifyUser(user.id)}
                      >
                        Verifică
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-6">
                Nu există utilizatori care să corespundă criteriilor selectate.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}