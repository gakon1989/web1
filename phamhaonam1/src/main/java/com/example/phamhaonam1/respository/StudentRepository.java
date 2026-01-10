package com.example.phamhaonam1.respository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.phamhaonam1.model.Student;

public interface StudentRepository extends JpaRepository<Student, Integer> {

    List<Student> findByNameContainingIgnoreCase(String name);
}
