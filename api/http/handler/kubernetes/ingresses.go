package kubernetes

import (
	"fmt"
	"net/http"

	httperror "github.com/portainer/libhttp/error"
	"github.com/portainer/libhttp/request"
	"github.com/portainer/libhttp/response"
	portainer "github.com/portainer/portainer/api"
	"github.com/portainer/portainer/api/database/models"
	portainerDsErrors "github.com/portainer/portainer/api/dataservices/errors"
)

func (handler *Handler) getKubernetesIngressControllers(w http.ResponseWriter, r *http.Request) *httperror.HandlerError {
	endpointID, err := request.RetrieveNumericRouteVariableValue(r, "id")
	if err != nil {
		return &httperror.HandlerError{
			StatusCode: http.StatusBadRequest,
			Message:    "Invalid environment identifier route variable",
			Err:        err,
		}
	}

	endpoint, err := handler.dataStore.Endpoint().Endpoint(portainer.EndpointID(endpointID))
	if err == portainerDsErrors.ErrObjectNotFound {
		return &httperror.HandlerError{
			StatusCode: http.StatusNotFound,
			Message:    "Unable to find an environment with the specified identifier inside the database",
			Err:        err,
		}
	} else if err != nil {
		return &httperror.HandlerError{
			StatusCode: http.StatusInternalServerError,
			Message:    "Unable to find an environment with the specified identifier inside the database",
			Err:        err,
		}
	}

	cli, err := handler.kubernetesClientFactory.GetKubeClient(endpoint)
	if err != nil {
		return &httperror.HandlerError{
			StatusCode: http.StatusInternalServerError,
			Message:    "Unable to create Kubernetes client",
			Err:        err,
		}
	}

	controllers := cli.GetIngressControllers()
	existingClasses := endpoint.Kubernetes.Configuration.IngressClasses
	for i := range controllers {
		controllers[i].Availability = true
		controllers[i].New = true

		// Check if the controller is blocked globally.
		for _, a := range existingClasses {
			controllers[i].New = false
			if controllers[i].ClassName != a.Name {
				continue
			}
			controllers[i].New = false

			// Skip over non-global blocks.
			if len(a.BlockedNamespaces) > 0 {
				continue
			}

			if controllers[i].ClassName == a.Name {
				controllers[i].Availability = !a.Blocked
			}
		}
		// TODO: Update existingClasses to take care of New and remove no longer
		// existing classes.
	}
	return response.JSON(w, controllers)
}

func (handler *Handler) getKubernetesIngressControllersByNamespace(w http.ResponseWriter, r *http.Request) *httperror.HandlerError {
	endpointID, err := request.RetrieveNumericRouteVariableValue(r, "id")
	if err != nil {
		return &httperror.HandlerError{
			StatusCode: http.StatusBadRequest,
			Message:    "Invalid environment identifier route variable",
			Err:        err,
		}
	}

	endpoint, err := handler.dataStore.Endpoint().Endpoint(portainer.EndpointID(endpointID))
	if err == portainerDsErrors.ErrObjectNotFound {
		return &httperror.HandlerError{
			StatusCode: http.StatusNotFound,
			Message:    "Unable to find an environment with the specified identifier inside the database",
			Err:        err,
		}
	} else if err != nil {
		return &httperror.HandlerError{
			StatusCode: http.StatusInternalServerError,
			Message:    "Unable to find an environment with the specified identifier inside the database",
			Err:        err,
		}
	}

	namespace, err := request.RetrieveRouteVariableValue(r, "namespace")
	if err != nil {
		return &httperror.HandlerError{
			StatusCode: http.StatusBadRequest,
			Message:    "Invalid namespace identifier route variable",
			Err:        err,
		}
	}

	cli, err := handler.kubernetesClientFactory.GetKubeClient(endpoint)
	if err != nil {
		return &httperror.HandlerError{
			StatusCode: http.StatusInternalServerError,
			Message:    "Unable to create Kubernetes client",
			Err:        err,
		}
	}

	controllers := cli.GetIngressControllers()
	existingClasses := endpoint.Kubernetes.Configuration.IngressClasses
	for i := range controllers {
		controllers[i].Availability = true
		controllers[i].New = true

		// Check if the controller is blocked globally or in the current
		// namespace.
		for _, a := range existingClasses {
			if controllers[i].ClassName != a.Name {
				continue
			}
			controllers[i].New = false

			// If it's not blocked we're all done!
			if !a.Blocked {
				continue
			}

			// Global blocks.
			if len(a.BlockedNamespaces) == 0 {
				controllers[i].Availability = false
				continue
			}

			// Also check the current namespace.
			for _, ns := range a.BlockedNamespaces {
				if namespace == ns {
					controllers[i].Availability = false
				}
			}
		}
		// TODO: Update existingClasses to take care of New and remove no longer
		// existing classes.
	}
	return response.JSON(w, controllers)
}

func (handler *Handler) updateKubernetesIngressControllers(w http.ResponseWriter, r *http.Request) *httperror.HandlerError {
	endpointID, err := request.RetrieveNumericRouteVariableValue(r, "id")
	if err != nil {
		return &httperror.HandlerError{
			StatusCode: http.StatusBadRequest,
			Message:    "Invalid environment identifier route variable",
			Err:        err,
		}
	}

	endpoint, err := handler.dataStore.Endpoint().Endpoint(portainer.EndpointID(endpointID))
	if err == portainerDsErrors.ErrObjectNotFound {
		return &httperror.HandlerError{
			StatusCode: http.StatusNotFound,
			Message:    "Unable to find an environment with the specified identifier inside the database",
			Err:        err,
		}
	} else if err != nil {
		return &httperror.HandlerError{
			StatusCode: http.StatusInternalServerError,
			Message:    "Unable to find an environment with the specified identifier inside the database",
			Err:        err,
		}
	}

	var payload models.K8sIngressControllers
	err = request.DecodeAndValidateJSONPayload(r, &payload)
	if err != nil {
		return &httperror.HandlerError{
			StatusCode: http.StatusBadRequest,
			Message:    "Invalid request payload",
			Err:        err,
		}
	}

	classes := endpoint.Kubernetes.Configuration.IngressClasses
	for _, p := range payload {
		for i := range classes {
			if p.ClassName == classes[i].Name {
				classes[i].Blocked = !p.Availability
			}
		}
	}
	endpoint.Kubernetes.Configuration.IngressClasses = classes
	fmt.Printf("%#v\n", endpoint.Kubernetes.Configuration.IngressClasses)
	err = handler.dataStore.Endpoint().UpdateEndpoint(
		portainer.EndpointID(endpointID),
		endpoint,
	)
	if err != nil {
		return &httperror.HandlerError{
			StatusCode: http.StatusInternalServerError,
			Message:    "Unable to update the BlockedIngressClasses inside the database",
			Err:        err,
		}
	}
	return nil
}

func (handler *Handler) updateKubernetesIngressControllersByNamespace(w http.ResponseWriter, r *http.Request) *httperror.HandlerError {
	endpointID, err := request.RetrieveNumericRouteVariableValue(r, "id")
	if err != nil {
		return &httperror.HandlerError{
			StatusCode: http.StatusBadRequest,
			Message:    "Invalid environment identifier route variable",
			Err:        err,
		}
	}

	endpoint, err := handler.dataStore.Endpoint().Endpoint(portainer.EndpointID(endpointID))
	if err == portainerDsErrors.ErrObjectNotFound {
		return &httperror.HandlerError{
			StatusCode: http.StatusNotFound,
			Message:    "Unable to find an environment with the specified identifier inside the database",
			Err:        err,
		}
	} else if err != nil {
		return &httperror.HandlerError{
			StatusCode: http.StatusInternalServerError,
			Message:    "Unable to find an environment with the specified identifier inside the database",
			Err:        err,
		}
	}

	namespace, err := request.RetrieveRouteVariableValue(r, "namespace")
	if err != nil {
		return &httperror.HandlerError{
			StatusCode: http.StatusBadRequest,
			Message:    "Invalid namespace identifier route variable",
			Err:        err,
		}
	}

	var payload models.K8sIngressControllers
	err = request.DecodeAndValidateJSONPayload(r, &payload)
	if err != nil {
		return &httperror.HandlerError{
			StatusCode: http.StatusBadRequest,
			Message:    "Invalid request payload",
			Err:        err,
		}
	}

	classes := endpoint.Kubernetes.Configuration.IngressClasses
PayloadLoop:
	for _, p := range payload {
		for i := range classes {
			if p.ClassName == classes[i].Name {
				if p.Availability == true {
					classes[i].Blocked = false
					classes[i].BlockedNamespaces = []string{}
					continue PayloadLoop
				}

				// If it's meant to be blocked we need to add the current
				// namespace. First, check if it's already in the
				// BlockedNamespaces and if not we append it.
				classes[i].Blocked = true
				for _, ns := range classes[i].BlockedNamespaces {
					if namespace == ns {
						continue PayloadLoop
					}
				}
				classes[i].BlockedNamespaces = append(
					classes[i].BlockedNamespaces,
					namespace,
				)
			}
		}
	}
	endpoint.Kubernetes.Configuration.IngressClasses = classes
	fmt.Printf("%#v\n", endpoint.Kubernetes.Configuration.IngressClasses)
	err = handler.dataStore.Endpoint().UpdateEndpoint(
		portainer.EndpointID(endpointID),
		endpoint,
	)
	if err != nil {
		return &httperror.HandlerError{
			StatusCode: http.StatusInternalServerError,
			Message:    "Unable to update the BlockedIngressClasses inside the database",
			Err:        err,
		}
	}
	return nil
}

func (handler *Handler) getKubernetesIngresses(w http.ResponseWriter, r *http.Request) *httperror.HandlerError {
	namespace, err := request.RetrieveRouteVariableValue(r, "namespace")
	if err != nil {
		return &httperror.HandlerError{
			StatusCode: http.StatusBadRequest,
			Message:    "Invalid namespace identifier route variable",
			Err:        err,
		}
	}

	cli := handler.KubernetesClient
	ingresses, err := cli.GetIngresses(namespace)
	if err != nil {
		return &httperror.HandlerError{
			StatusCode: http.StatusInternalServerError,
			Message:    "Unable to retrieve nodes limits",
			Err:        err,
		}
	}

	return response.JSON(w, ingresses)
}

func (handler *Handler) createKubernetesIngress(w http.ResponseWriter, r *http.Request) *httperror.HandlerError {
	namespace, err := request.RetrieveRouteVariableValue(r, "namespace")
	if err != nil {
		return &httperror.HandlerError{
			StatusCode: http.StatusBadRequest,
			Message:    "Invalid namespace identifier route variable",
			Err:        err,
		}
	}

	var payload models.K8sIngressInfo
	err = request.DecodeAndValidateJSONPayload(r, &payload)
	if err != nil {
		return &httperror.HandlerError{
			StatusCode: http.StatusBadRequest,
			Message:    "Invalid request payload",
			Err:        err,
		}
	}

	cli := handler.KubernetesClient
	err = cli.CreateIngress(namespace, payload)
	if err != nil {
		return &httperror.HandlerError{
			StatusCode: http.StatusInternalServerError,
			Message:    "Unable to retrieve nodes limits",
			Err:        err,
		}
	}
	return nil
}

func (handler *Handler) deleteKubernetesIngresses(w http.ResponseWriter, r *http.Request) *httperror.HandlerError {
	cli := handler.KubernetesClient

	var payload models.K8sIngressDeleteRequests
	err := request.DecodeAndValidateJSONPayload(r, &payload)
	if err != nil {
		return httperror.BadRequest("Invalid request payload", err)
	}

	err = cli.DeleteIngresses(payload)
	if err != nil {
		return &httperror.HandlerError{
			StatusCode: http.StatusInternalServerError,
			Message:    "Unable to retrieve nodes limits",
			Err:        err,
		}
	}
	return nil
}

func (handler *Handler) updateKubernetesIngress(w http.ResponseWriter, r *http.Request) *httperror.HandlerError {
	namespace, err := request.RetrieveRouteVariableValue(r, "namespace")
	if err != nil {
		return &httperror.HandlerError{
			StatusCode: http.StatusBadRequest,
			Message:    "Invalid namespace identifier route variable",
			Err:        err,
		}
	}

	var payload models.K8sIngressInfo
	err = request.DecodeAndValidateJSONPayload(r, &payload)
	if err != nil {
		return &httperror.HandlerError{
			StatusCode: http.StatusBadRequest,
			Message:    "Invalid request payload",
			Err:        err,
		}
	}

	cli := handler.KubernetesClient
	err = cli.UpdateIngress(namespace, payload)
	if err != nil {
		return &httperror.HandlerError{
			StatusCode: http.StatusInternalServerError,
			Message:    "Unable to retrieve nodes limits",
			Err:        err,
		}
	}
	return nil
}
