import { useEffect, useState } from "react";
import axiosClient from "../../../api/client";

export default function Home() {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    axiosClient.get("/challenges").then((response) => {
      setUsers(response.data);
      console.log(response);
    });
  }, []);


  return (
    <div>
      <h1>Danh sách người dùng</h1>
      <ul>
        {users.map((u) => (
          <li key={u.id}>{u.name}</li>
        ))}
      </ul>
    </div>
  );
}
