import { Input } from "@/components_1/ui/input";
import { SimpleSelect } from "@/components_1/ui/simple-select";
import { Button } from "@/components_1/ui/button";
import { UserFormInput, RoleGet } from "../types/user.dto";

interface Props {
  form: UserFormInput;
  roles: RoleGet[];
  isEdit: boolean;
  onChange: (f: UserFormInput) => void;
  onSubmit: () => void;
}

export function UserForm({ form, roles, isEdit, onChange, onSubmit }: Props) {
  return (
    <div className="p-4 bg-white rounded-lg shadow-md space-y-4">
      <h2 className="text-xl font-bold">{isEdit ? "Cập nhật User" : "Thêm User"}</h2>

      <Input
        placeholder="Full Name"
        value={form.fullName}
        onChange={(e) => onChange({ ...form, fullName: e.target.value })}
      />

      <Input
        placeholder="Email"
        value={form.email}
        onChange={(e) => onChange({ ...form, email: e.target.value })}
      />

      {!isEdit && (
        <Input
          placeholder="Password"
          type="password"
          value={form.password}
          onChange={(e) => onChange({ ...form, password: e.target.value })}
        />
      )}

      <SimpleSelect
        placeholder="Chọn Role"
        value={form.roleId}
        onValueChange={(value) => onChange({ ...form, roleId: Number(value) })}
        options={roles.map((r) => ({ label: r.name, value: r.id }))}
      />

      <Button onClick={onSubmit} className="w-full">
        {isEdit ? "Cập nhật" : "Tạo mới"}
      </Button>
    </div>
  );
}
