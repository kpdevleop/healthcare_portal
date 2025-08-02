package com.healthcare;

import org.modelmapper.Conditions;
import org.modelmapper.ModelMapper;
import org.modelmapper.convention.MatchingStrategies;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import com.healthcare.entity.Department;
import com.healthcare.repository.DepartmentRepository;

@SpringBootApplication // includes @Configuration
public class Application {

	public static void main(String[] args) {
		SpringApplication.run(Application.class, args);
	}

	/*
	 * Configure ModelMapper as spring bean - so thar SC will manage it's life cycle
	 * + provide it as the depcy
	 */
	@Bean // method level annotation - to tell SC , following method
	// rets an object - which has to be managed as a spring bean
	// manages - life cycle +
	public ModelMapper modelMapper() {
		System.out.println("in model mapper creation");
		ModelMapper mapper = new ModelMapper();
		mapper.getConfiguration()
				/*
				 * To tell ModelMapper to map only those props whose names match in src n dest.
				 * objects
				 */
				.setMatchingStrategy(MatchingStrategies.STRICT)
				/*
				 * To tell ModelMapper not to transfer nulls from src -> dest
				 */
				.setPropertyCondition(Conditions.isNotNull());// use case - PUT
		return mapper;

	}

	@Bean
	public CommandLineRunner initData(DepartmentRepository departmentRepository) {
		return args -> {
			// Initialize default departments if none exist
			if (departmentRepository.count() == 0) {
				Department cardiology = Department.builder()
					.name("Cardiology")
					.description("Heart and cardiovascular system treatment")
					.build();
				departmentRepository.save(cardiology);
				
				Department neurology = Department.builder()
					.name("Neurology")
					.description("Brain and nervous system treatment")
					.build();
				departmentRepository.save(neurology);
				
				Department orthopedics = Department.builder()
					.name("Orthopedics")
					.description("Bones, joints, and musculoskeletal system")
					.build();
				departmentRepository.save(orthopedics);
				
				Department pediatrics = Department.builder()
					.name("Pediatrics")
					.description("Medical care for infants, children, and adolescents")
					.build();
				departmentRepository.save(pediatrics);
				
				Department dermatology = Department.builder()
					.name("Dermatology")
					.description("Skin, hair, and nail conditions")
					.build();
				departmentRepository.save(dermatology);
				
				System.out.println("Default departments initialized successfully!");
			}
		};
	}
}
