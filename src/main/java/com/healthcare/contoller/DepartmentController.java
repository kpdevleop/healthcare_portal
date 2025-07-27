package com.healthcare.contoller;

import com.healthcare.entity.Department;
import com.healthcare.repository.DepartmentRepository;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/departments")
public class DepartmentController {

    @Autowired
    private DepartmentRepository departmentDao;

    @PostMapping
    @PreAuthorize("hasRole('ROLE_ADMIN')") // Only Admins can add departments
    public ResponseEntity<Department> addDepartment(@Valid @RequestBody Department department) {
        Department savedDepartment = departmentDao.save(department);
        return new ResponseEntity<>(savedDepartment, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<Department>> getAllDepartments() {
        List<Department> departments = departmentDao.findAll();
        return ResponseEntity.ok(departments);
    }

    // Other CRUD operations for departments
}