const API_BASE = '/api/students'; // localhost:8080/api/students


// hàm lấy phần tử theo id
function qs(id){
  return document.getElementById(id)}


// lấy dữ liệu sinh viên
async function fetchStudents(){
  try{
    const res = await fetch(API_BASE);
    let data = await res.json();
    
    // Nếu API trả về array trực tiếp
    if(Array.isArray(data)){
      renderTable(data);
    }
    // Nếu API trả về object chứa array
    else if(data && Array.isArray(data.content)){
      renderTable(data.content);
    }
    else if(data && Array.isArray(data._embedded?.hocsinh)){
      renderTable(data._embedded.hocsinh);
    }
    else {
      renderTable(data);
    }
  }catch(err){alert('Lỗi khi tải danh sách: '+err)}
}


// hiển thị dữ liệu sinh viên lên bảng
function renderTable(students){
  const tbody = qs('studentsTable');
  // xóa dữ liệu cũ
  tbody.innerHTML = '';
  if(!students || students.length===0){
    tbody.innerHTML = '<tr><td colspan="4">Không có sinh viên</td></tr>';
    return;
  }
  students.forEach(s=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${s.id ?? ''}</td>
      <td>${escapeHtml(s.name ?? '')}</td>
      <td>${escapeHtml(s.email ?? '')}</td>
      <td>
        <button class="action-btn edit-btn" onclick="onEdit(${s.id})">Sửa</button>
        <button class="action-btn delete-btn" onclick="onDelete(${s.id})">Xóa</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}


// hàm để tránh lỗi hiển thị HTML
function escapeHtml(text){
  return text.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
}


// xử lý xóa sinh viên
async function onDelete(id){
  if(!confirm('Xóa sinh viên có ID '+id+'?')) return;
  try{
    await fetch(`${API_BASE}/delete/${id}`,{method:'POST'});
    fetchStudents();
  }catch(err){alert('Xóa lỗi: '+err)}
}



// xử lý sửa sinh viên
async function onEdit(id){
  try{
    const res = await fetch(`${API_BASE}/${id}`);
    const s = await res.json();
    const newName = prompt('Tên:', s.name);
    if(newName===null) return;
    const newEmail = prompt('Email:', s.email);
    if(newEmail===null) return;
    await fetch(`${API_BASE}/update/${id}`,{
      method:'POST',
      headers:{'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8'},
      body: new URLSearchParams({name:newName,email:newEmail})
    });
    fetchStudents();
  }catch(err){alert('Sửa lỗi: '+err)}
}



document.addEventListener('DOMContentLoaded',()=>{
  // xử lý thêm sinh viên
  qs('addForm').addEventListener('submit',async e=>{
    e.preventDefault();
    const name = qs('nameInput').value.trim();
    const email = qs('emailInput').value.trim();
    if(!name||!email){alert('Vui lòng nhập tên và email');return}
    try{
      await fetch(API_BASE,{
        method:'POST',
        headers:{'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8'},
        body: new URLSearchParams({name,email})
      });
      qs('nameInput').value=''; qs('emailInput').value='';
      fetchStudents();
    }catch(err){alert('Thêm lỗi: '+err)}
  });
  // xử lý tìm kiếm sinh viên
  qs('searchBtn').addEventListener('click', async ()=>{
    const q = qs('searchInput').value.trim();
    if(!q){fetchStudents();return}
    try{
      const res = await fetch(`${API_BASE}/search?name=${encodeURIComponent(q)}`);
      const data = await res.json();
      renderTable(data);
    }catch(err){alert('Tìm kiếm lỗi: '+err)}
  });
  // xử lý tìm kiếm theo ID
  qs('searchIdBtn').addEventListener('click', async ()=>{
    const id = qs('idInput').value.trim();
    if(!id){fetchStudents(); return}
    if(!/^[0-9]+$/.test(id)){alert('ID không hợp lệ'); return}
    try{
      const res = await fetch(`${API_BASE}/${encodeURIComponent(id)}`);
      // try to parse JSON safely
      let student = null;
      try{ student = await res.json(); }catch(e){ student = null }
      if(!student){
        qs('studentsTable').innerHTML = '<tr><td colspan="4">Không tìm thấy sinh viên</td></tr>';
        return;
      }
      renderTable([student]);
    }catch(err){alert('Tìm theo ID lỗi: '+err)}
  });

  fetchStudents();
});
