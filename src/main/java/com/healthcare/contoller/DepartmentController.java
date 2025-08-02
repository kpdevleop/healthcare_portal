package com.healthcare.contoller;

import com.healthcare.dto.ApiResponse;
import com.healthcare.dto.DepartmentDTO;
import com.healthcare.dto.DepartmentRequestDTO;
import com.healthcare.entity.Department;
import com.healthcare.repository.DepartmentRepository;
import com.healthcare.custom_exceptions.ResourceNotFoundException;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/departments")
@CrossOrigin(origins = "*")
public class DepartmentController {

    @Autowired
    private DepartmentRepository departmentDao;



    @PostMapping
    @PreAuthorize("hasRole('ROLE_ADMIN')") // Only Admins can add departments
    public ResponseEntity<ApiResponse<DepartmentDTO>> addDepartment(@Valid @RequestBody DepartmentRequestDTO departmentRequest) {
        try {
            // Check if department with same name already exists
            Optional<Department> existingDept = departmentDao.findByNameIgnoreCase(departmentRequest.getName());
            if (existingDept.isPresent()) {
                return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, "Department with this name already exists", null));
            }
            
            Department department = Department.builder()
                .name(departmentRequest.getName())
                .description(departmentRequest.getDescription())
                .build();
            
            Department savedDepartment = departmentDao.save(department);
            DepartmentDTO departmentDTO = DepartmentDTO.fromEntity(savedDepartment);
            return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(true, "Department created successfully", departmentDTO));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse<>(false, "Error creating department: " + e.getMessage(), null));
        }
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<DepartmentDTO>>> getAllDepartments() {
        try {
            List<Department> departments = departmentDao.findAllDepartments();
            List<DepartmentDTO> departmentDTOs = departments.stream()
                .map(DepartmentDTO::fromEntity)
                .collect(Collectors.toList());
            return ResponseEntity.ok(new ApiResponse<>(true, "Departments retrieved successfully", departmentDTOs));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse<>(false, "Error retrieving departments: " + e.getMessage(), null));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DepartmentDTO>> getDepartmentById(@PathVariable Long id) {
        try {
            Department department = departmentDao.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + id));
            DepartmentDTO departmentDTO = DepartmentDTO.fromEntity(department);
            return ResponseEntity.ok(new ApiResponse<>(true, "Department retrieved successfully", departmentDTO));
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ApiResponse<>(false, e.getMessage(), null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse<>(false, "Error retrieving department: " + e.getMessage(), null));
        }
    }



    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<DepartmentDTO>> updateDepartment(@PathVariable Long id, @Valid @RequestBody DepartmentRequestDTO departmentRequest) {
        try {
            Department department = departmentDao.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + id));
            
            // Check if new name conflicts with existing department (excluding current one)
            Optional<Department> existingDept = departmentDao.findByNameIgnoreCaseAndIdNot(departmentRequest.getName(), id);
            if (existingDept.isPresent()) {
                return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, "Department with this name already exists", null));
            }
            
            department.setName(departmentRequest.getName());
            department.setDescription(departmentRequest.getDescription());
            
            Department updatedDepartment = departmentDao.save(department);
            DepartmentDTO departmentDTO = DepartmentDTO.fromEntity(updatedDepartment);
            return ResponseEntity.ok(new ApiResponse<>(true, "Department updated successfully", departmentDTO));
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ApiResponse<>(false, e.getMessage(), null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse<>(false, "Error updating department: " + e.getMessage(), null));
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<String>> deleteDepartment(@PathVariable Long id) {
        try {
            Department department = departmentDao.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + id));
            
            // Check if department has associated users using optimized query
            if (departmentDao.hasUsers(id)) {
                return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, "Cannot delete department with associated users", null));
            }
            
            departmentDao.delete(department);
            return ResponseEntity.ok(new ApiResponse<>(true, "Department deleted successfully", null));
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ApiResponse<>(false, e.getMessage(), null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse<>(false, "Error deleting department: " + e.getMessage(), null));
        }
    }
}