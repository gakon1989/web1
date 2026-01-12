const API_BASE = '/api/students';

function qs(id){return document.getElementById(id)}

async function fetchStudents(){
  try{
    const res = await fetch(API_BASE);
    const data = await res.json();
    renderTable(data);
  }catch(err){alert('Lỗi khi tải danh sách: '+err)}
}

function renderTable(students){
  const tbody = qs('studentsTable');
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

function escapeHtml(text){
  return text.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
}

async function onDelete(id){
  if(!confirm('Xóa sinh viên có ID '+id+'?')) return;
  try{
    await fetch(`${API_BASE}/delete/${id}`,{method:'POST'});
    fetchStudents();
  }catch(err){alert('Xóa lỗi: '+err)}
}

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

  qs('searchBtn').addEventListener('click', async ()=>{
    const q = qs('searchInput').value.trim();
    if(!q){fetchStudents();return}
    try{
      const res = await fetch(`${API_BASE}/search?name=${encodeURIComponent(q)}`);
      const data = await res.json();
      renderTable(data);
    }catch(err){alert('Tìm kiếm lỗi: '+err)}
  });

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
